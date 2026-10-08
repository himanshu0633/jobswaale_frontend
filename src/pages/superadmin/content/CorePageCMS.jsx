import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  AutoImage,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FileRepository,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { BASE_API_URL } from '../../../context/AuthContext';
import { resolveCmsImageUrl, BANNER_POSITIONS, getPageBanners } from '../../../utils/cmsHelper';
import { DevToolsColorPicker } from '../../../components/DevToolsColorPicker';
import { MagicBgRemoverModal } from '../../../components/MagicBgRemoverModal';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_TERMS_CONTENT,
  DEFAULT_TERMS_SECTIONS,
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_PRIVACY_SECTIONS
} from '../../../utils/defaultCmsContent';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Loader,
  Plus,
  RotateCcw,
  Save,
  Scale,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Custom CKEditor 5 upload adapter for saving images directly to backend storage.
 */
class CMSUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then((file) => {
      return new Promise((resolve, reject) => {
        if (!file) return reject('No file selected.');

        if (file.size > 5 * 1024 * 1024) {
          return reject('Image size cannot exceed 5 MB.');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return reject('Only JPG, PNG, GIF, and WEBP images are allowed.');
        }

        const formData = new FormData();
        formData.append('image', file);

        axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
          headers: getAuthHeaders()
        })
          .then((response) => {
            const data = response.data;
            const url = resolveCmsImageUrl(data.imageUrl || data.url || data.default);
            if (url) {
              resolve({ default: url });
            } else {
              reject(data.message || 'Image upload failed.');
            }
          })
          .catch((err) => {
            reject(err.response?.data?.message || err.message || 'Image upload failed.');
          });
      });
    });
  }

  abort() {}
}

function CMSUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new CMSUploadAdapter(loader);
  };
}

export const CORE_PAGES_CONFIG = {
  about: {
    key: 'about',
    label: 'About Us',
    slug: 'about',
    publicUrl: '/about',
    icon: Building,
    defaultTitle: 'About Us',
    defaultContent: DEFAULT_ABOUT_CONTENT,
    defaultSections: DEFAULT_ABOUT_SECTIONS,
    description: 'Company introduction, mission, vision, values, and section-by-section content.'
  },
  terms: {
    key: 'terms',
    label: 'Terms & Conditions',
    slug: 'terms-conditions',
    publicUrl: '/terms-conditions',
    icon: Scale,
    defaultTitle: 'Terms & Conditions',
    defaultContent: DEFAULT_TERMS_CONTENT,
    defaultSections: DEFAULT_TERMS_SECTIONS,
    description: 'Terms of service, platform policies, user and employer agreements, and section-by-section rules.'
  },
  privacy: {
    key: 'privacy',
    label: 'Privacy Policy',
    slug: 'privacy-policy',
    publicUrl: '/privacy-policy',
    icon: Shield,
    defaultTitle: 'Privacy Policy',
    defaultContent: DEFAULT_PRIVACY_CONTENT,
    defaultSections: DEFAULT_PRIVACY_SECTIONS,
    description: 'Data collection practices, security, user privacy rights, cookies, and modular clauses.'
  }
};

export const CorePageCMS = ({ pageKey = 'about' }) => {
  const corePage = CORE_PAGES_CONFIG[pageKey] || CORE_PAGES_CONFIG.about;
  const PageIcon = corePage.icon;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Form state
  const [form, setForm] = useState(() => ({
    title: corePage.defaultTitle,
    slug: corePage.slug,
    parentPage: '',
    published: true,
    featuredImage: '',
    bannerImage: '',
    banners: [],
    sections: corePage.defaultSections || [],
    sortingOrder: 10,
    seoTitle: `${corePage.defaultTitle} - JobsWaale`,
    seoDescription: corePage.description,
    seoKeywords: `${corePage.defaultTitle}, JobsWaale, career`,
    contentHtml: corePage.defaultContent,
    projectData: { editor: 'ckeditor', html: corePage.defaultContent }
  }));

  // Modular sections state
  const [selectedSectionId, setSelectedSectionId] = useState('hero');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bgRemoverOpen, setBgRemoverOpen] = useState(false);
  const [savedSectionsSnapshot, setSavedSectionsSnapshot] = useState({});
  const [showUnsavedWarningModal, setShowUnsavedWarningModal] = useState(false);
  const [pendingTargetSectionId, setPendingTargetSectionId] = useState(null);

  // Centered Success Notification Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '', url: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') {
      setTimeout(() => setAlert({ type: '', text: '' }), 4000);
    }
  };

  // Currently active section being edited
  const currentSection = useMemo(() => {
    if (!form.sections || form.sections.length === 0) return null;
    return form.sections.find(s => s.id === selectedSectionId) || form.sections[0];
  }, [form.sections, selectedSectionId]);

  // Dirty check: whether current section differs from its saved snapshot
  const isCurrentSectionDirty = useMemo(() => {
    if (!currentSection || !savedSectionsSnapshot[currentSection.id]) return false;
    return JSON.stringify(currentSection) !== savedSectionsSnapshot[currentSection.id];
  }, [currentSection, savedSectionsSnapshot]);

  // Section navigation guard: Prevent switching if current section has unsaved changes
  const handleSelectSection = (targetId) => {
    if (!targetId || targetId === selectedSectionId) return;

    if (isCurrentSectionDirty) {
      setPendingTargetSectionId(targetId);
      setShowUnsavedWarningModal(true);
      return;
    }

    setSelectedSectionId(targetId);
    setShowColorPicker(false);
  };

  // Dismiss / Revert unsaved edits in current section and continue to target
  const handleDismissUnsavedChanges = () => {
    if (currentSection && savedSectionsSnapshot[currentSection.id]) {
      try {
        const originalSec = JSON.parse(savedSectionsSnapshot[currentSection.id]);
        setForm(prev => ({
          ...prev,
          sections: (prev.sections || []).map(s => s.id === currentSection.id ? originalSec : s)
        }));
      } catch (e) {
        console.error('Error parsing section snapshot:', e);
      }
    }
    setShowUnsavedWarningModal(false);
    const targetToSwitch = pendingTargetSectionId;
    setPendingTargetSectionId(null);
    if (targetToSwitch) {
      if (targetToSwitch === '__new__') {
        executeAddNewSection();
      } else {
        setSelectedSectionId(targetToSwitch);
      }
    }
    setShowColorPicker(false);
    showAlert('info', `Section #${currentSection?.sortOrder} ke unsaved changes revert kar diye gaye.`);
  };

  // Save changes in current section to database and then continue to target
  const handleSaveAndContinue = async () => {
    setShowUnsavedWarningModal(false);
    const targetToSwitch = pendingTargetSectionId;
    setPendingTargetSectionId(null);
    await handleSaveSingleCurrentSection();
    if (targetToSwitch) {
      if (targetToSwitch === '__new__') {
        executeAddNewSection();
      } else {
        setSelectedSectionId(targetToSwitch);
      }
    }
    setShowColorPicker(false);
  };

  // Sorted list of sections for display
  const sortedSections = useMemo(() => {
    if (!form.sections || !Array.isArray(form.sections)) return [];
    return [...form.sections].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  }, [form.sections]);

  // Update a field in the currently active section
  const updateCurrentSection = (field, value) => {
    if (!currentSection) return;
    setForm(prev => {
      const updated = (prev.sections || []).map(sec => {
        if (sec.id === currentSection.id) {
          return { ...sec, [field]: value };
        }
        return sec;
      });
      return { ...prev, sections: updated };
    });
  };

  // Update nested image properties for currently active section
  const updateCurrentSectionImage = (imgField, value) => {
    if (!currentSection) return;
    setForm(prev => {
      const updated = (prev.sections || []).map(sec => {
        if (sec.id === currentSection.id) {
          const curImg = sec.image || {};
          return { ...sec, image: { ...curImg, [imgField]: value } };
        }
        return sec;
      });
      return { ...prev, sections: updated };
    });
  };

  // Update button properties for currently active section
  const updateCurrentSectionButton = (btnType, field, value) => {
    if (!currentSection) return;
    setForm(prev => {
      const updated = (prev.sections || []).map(sec => {
        if (sec.id === currentSection.id) {
          const curBtn = sec[btnType] || {};
          return { ...sec, [btnType]: { ...curBtn, [field]: value } };
        }
        return sec;
      });
      return { ...prev, sections: updated };
    });
  };

  // Upload an image specifically for the current section
  const handleUploadSectionImage = async (file) => {
    if (!file) return;
    setUploadingBanner(true);
    setAlert({ type: '', text: '' });
    try {
      const uploadedUrl = await handleUploadBannerFile(file);
      if (!uploadedUrl) return;
      updateCurrentSectionImage('url', uploadedUrl);
      showAlert('success', 'Section image uploaded successfully! Click "Save Changes" to publish.');
    } catch (err) {
      console.error('Section image upload failed:', err);
      showAlert('error', err.response?.data?.message || err.message || 'Image upload failed.');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Reorder sections up or down
  const handleMoveSection = (direction) => {
    if (!currentSection || !form.sections) return;
    const sorted = [...form.sections].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    const currentIndex = sorted.findIndex(s => s.id === currentSection.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentOrder = Number(sorted[currentIndex].sortOrder) || (currentIndex + 1);
    const targetOrder = Number(sorted[targetIndex].sortOrder) || (targetIndex + 1);

    sorted[currentIndex].sortOrder = targetOrder;
    sorted[targetIndex].sortOrder = currentOrder;

    setForm(prev => ({ ...prev, sections: sorted }));
  };

  // Core executor for adding a new section
  const executeAddNewSection = () => {
    const nextOrder = (form.sections?.length || 0) + 1;
    const newId = `section_${Date.now()}`;
    const newSection = {
      id: newId,
      name: `Custom Section ${nextOrder}`,
      sortOrder: nextOrder,
      active: true,
      layout: 'text-left-image-right',
      title: 'New Section Title',
      subtitle: 'Add a description or subtitle for this section.',
      eyebrow: '',
      contentHtml: '<p>Edit this section content using CKEditor 5.</p>',
      image: {
        url: '',
        alt: 'Section image',
        position: 'right',
        width: 'medium',
        rounded: 'rounded-xl',
        spacingTop: 0,
        spacingBottom: 0,
        transparentBg: false,
        blendMode: 'normal'
      },
      primaryButton: { enabled: false, text: '', url: '', style: 'solid', target: '_self' },
      secondaryButton: { enabled: false, text: '', url: '', style: 'outline', target: '_self' },
      bgColor: '#ffffff',
      textColor: '#0f172a',
      paddingTop: 'py-16',
      paddingBottom: 'py-16'
    };

    setForm(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection]
    }));

    setSavedSectionsSnapshot(prev => ({
      ...prev,
      [newId]: JSON.stringify(newSection)
    }));

    setSelectedSectionId(newId);
    showAlert('success', `New Section #${nextOrder} added! Customize it below and click "Save & Publish".`);
  };

  const handleAddNewSection = () => {
    if (isCurrentSectionDirty) {
      setPendingTargetSectionId('__new__');
      setShowUnsavedWarningModal(true);
      return;
    }
    executeAddNewSection();
  };

  // Delete current section
  const handleDeleteCurrentSection = () => {
    if (!currentSection) return;
    if (window.confirm(`Delete section "${currentSection.name || currentSection.title}"? Click "Save & Publish Changes" afterwards to update the live website.`)) {
      const remaining = (form.sections || []).filter(s => s.id !== currentSection.id);
      setForm(prev => ({ ...prev, sections: remaining }));

      const nextSnapshots = { ...savedSectionsSnapshot };
      delete nextSnapshots[currentSection.id];
      setSavedSectionsSnapshot(nextSnapshots);

      if (remaining.length > 0) {
        setSelectedSectionId(remaining[0].id);
      }
      showAlert('success', 'Section removed from editor. Click "Save & Publish Changes" to apply.');
    }
  };

  // Fetch page data from server
  const loadPageData = async () => {
    setLoading(true);
    setAlert({ type: '', text: '' });
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/by-slug/${corePage.slug}`, {
        headers: getAuthHeaders()
      });

      const pageData = res.data;
      const defaultSections = corePage.defaultSections || [];

      if (pageData && pageData.title) {
        setLastSavedTime(pageData.updatedAt || null);

        const bannersList = getPageBanners(pageData);
        const primaryBanner = bannersList[0]?.rawUrl || pageData.bannerImage || pageData.featuredImage || '';
        const sectionsList = (Array.isArray(pageData.sections) && pageData.sections.length > 0)
          ? pageData.sections
          : defaultSections;

        setForm({
          title: pageData.title || corePage.defaultTitle,
          slug: pageData.slug || corePage.slug,
          parentPage: pageData.parentPage?._id || pageData.parentPage || '',
          published: pageData.published !== false,
          featuredImage: primaryBanner,
          bannerImage: primaryBanner,
          banners: bannersList,
          sections: sectionsList,
          sortingOrder: pageData.sortingOrder || 10,
          seoTitle: pageData.seoTitle || '',
          seoDescription: pageData.seoDescription || '',
          seoKeywords: pageData.seoKeywords || '',
          contentHtml: pageData.html || corePage.defaultContent,
          projectData: pageData.projectData || { editor: 'ckeditor', html: pageData.html || corePage.defaultContent }
        });

        const snapshotMap = {};
        (sectionsList || []).forEach(s => { snapshotMap[s.id] = JSON.stringify(s); });
        setSavedSectionsSnapshot(snapshotMap);

        if (sectionsList.length > 0) {
          setSelectedSectionId(sectionsList[0].id);
        }
      } else {
        // Not yet saved in DB: initialize with default rich content
        setLastSavedTime(null);

        setForm({
          title: corePage.defaultTitle,
          slug: corePage.slug,
          parentPage: '',
          published: true,
          featuredImage: '',
          bannerImage: '',
          banners: [],
          sections: defaultSections,
          sortingOrder: 10,
          seoTitle: `${corePage.defaultTitle} - JobsWaale`,
          seoDescription: corePage.description,
          seoKeywords: `${corePage.defaultTitle}, JobsWaale, jobs, career, portal`,
          contentHtml: corePage.defaultContent,
          projectData: { editor: 'ckeditor', html: corePage.defaultContent }
        });

        const snapshotMap = {};
        (defaultSections || []).forEach(s => { snapshotMap[s.id] = JSON.stringify(s); });
        setSavedSectionsSnapshot(snapshotMap);

        if (defaultSections.length > 0) {
          setSelectedSectionId(defaultSections[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading core page:', err);
      showAlert('error', 'Could not load saved page content. Default template is loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [pageKey]);

  const handleResetToDefault = () => {
    if (window.confirm(`Reset "${corePage.label}" content to the standard default template? Any unsaved edits will be lost.`)) {
      const defaultSections = corePage.defaultSections || [];
      setForm(prev => ({
        ...prev,
        contentHtml: corePage.defaultContent,
        title: corePage.defaultTitle,
        sections: defaultSections
      }));
      const snapshotMap = {};
      (defaultSections || []).forEach(s => { snapshotMap[s.id] = JSON.stringify(s); });
      setSavedSectionsSnapshot(snapshotMap);
      if (defaultSections.length > 0) {
        setSelectedSectionId(defaultSections[0].id);
      }
      showAlert('success', 'Default template loaded into editor. Click "Save & Publish Changes" to apply.');
    }
  };

  const handleUploadBannerFile = async (file) => {
    if (!file) return null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('error', 'Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image.');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'File size exceeds 5 MB limit. Please select a smaller image.');
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    const res = await axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    const uploadedUrl = res.data?.imageUrl || res.data?.url || res.data?.default;
    if (!uploadedUrl) {
      throw new Error(res.data?.message || 'Server did not return image URL');
    }
    return uploadedUrl;
  };

  const handleCoreSave = async (e) => {
    if (e) e.preventDefault();

    setSaving(true);
    setAlert({ type: '', text: '' });

    const contentHtml = form.contentHtml || '';
    const bannersToSend = (form.banners || []).map(b => ({
      url: b.rawUrl || b.url,
      position: b.position || 'top-center',
      title: b.title || '',
      alt: b.alt || ''
    }));
    const primaryBanner = bannersToSend[0]?.url || form.bannerImage || form.featuredImage || '';

    // Clean sort orders for sections
    const cleanSections = (form.sections || []).map((sec, idx) => ({
      ...sec,
      sortOrder: Number(sec.sortOrder) || (idx + 1)
    }));

    const payload = {
      title: form.title.trim() || corePage.defaultTitle,
      slug: corePage.slug,
      html: contentHtml,
      published: form.published,
      projectData: { editor: 'ckeditor', html: contentHtml },
      bannerImage: primaryBanner,
      featuredImage: primaryBanner,
      banners: bannersToSend,
      sections: cleanSections,
      sortingOrder: Number(form.sortingOrder) || 10,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords
    };

    try {
      const res = await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/${corePage.slug}`,
        payload,
        { headers: getAuthHeaders() }
      );

      const savedData = res.data;
      setLastSavedTime(savedData.updatedAt || new Date().toISOString());

      const nextSnapshots = {};
      cleanSections.forEach(s => { nextSnapshots[s.id] = JSON.stringify(s); });
      setSavedSectionsSnapshot(nextSnapshots);

      setSuccessModalData({
        title: `"${corePage.label}" Saved Successfully!`,
        message: `All sections, layouts, sort order numbers, images, and content for "${corePage.label}" have been saved and updated live on the website.`,
        url: corePage.publicUrl
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving page:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save ONLY the currently active section to database
  const handleSaveSingleCurrentSection = async () => {
    if (!currentSection) return;
    setSaving(true);
    setAlert({ type: '', text: '' });

    try {
      const bannersToSend = (form.banners || []).map(b => ({
        url: b.rawUrl || b.url,
        position: b.position || 'top-center',
        title: b.title || '',
        alt: b.alt || ''
      }));
      const primaryBanner = bannersToSend[0]?.url || form.featuredImage || form.bannerImage || '';
      const contentHtml = form.contentHtml || '';

      const cleanSections = (form.sections || []).map((sec, idx) => ({
        ...sec,
        sortOrder: Number(sec.sortOrder) || (idx + 1)
      }));

      const payload = {
        title: form.title || corePage.defaultTitle,
        slug: corePage.slug,
        parentPage: null,
        published: form.published !== false,
        html: contentHtml,
        projectData: { editor: 'ckeditor', html: contentHtml },
        bannerImage: primaryBanner,
        featuredImage: primaryBanner,
        banners: bannersToSend,
        sections: cleanSections,
        sortingOrder: Number(form.sortingOrder) || 10,
        seoTitle: form.seoTitle || `${corePage.defaultTitle} - JobsWaale`,
        seoDescription: form.seoDescription || corePage.description,
        seoKeywords: form.seoKeywords || `${corePage.defaultTitle}, JobsWaale, career`
      };

      const res = await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/${corePage.slug}`,
        payload,
        { headers: getAuthHeaders() }
      );

      const savedData = res.data;
      setLastSavedTime(savedData.updatedAt || new Date().toISOString());

      setSavedSectionsSnapshot(prev => ({
        ...prev,
        [currentSection.id]: JSON.stringify(currentSection)
      }));

      setSuccessModalData({
        title: `Section #${currentSection.sortOrder} Saved Successfully!`,
        message: `"${corePage.defaultTitle || corePage.label}" - Section #${currentSection.sortOrder} has been saved and updated live on the website.`,
        url: corePage.publicUrl
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving single section:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBgRemovalSuccess = (newUrl) => {
    updateCurrentSectionImage('url', newUrl);
    updateCurrentSectionImage('transparentBg', true);
    updateCurrentSectionImage('blendMode', 'normal');
  };

  // CKEditor 5 configuration
  const editorConfig = useMemo(() => ({
    licenseKey: 'GPL',
    plugins: [
      Alignment,
      AutoImage,
      BlockQuote,
      Bold,
      Essentials,
      FileRepository,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      Image,
      ImageCaption,
      ImageInsert,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      MediaEmbed,
      Paragraph,
      SourceEditing,
      Strikethrough,
      Table,
      TableToolbar,
      Underline,
      CMSUploadAdapterPlugin
    ],
    toolbar: {
      items: [
        'heading',
        '|',
        'fontFamily',
        'fontSize',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'alignment',
        'bulletedList',
        'numberedList',
        'outdent',
        'indent',
        '|',
        'link',
        'insertImage',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        '|',
        'sourceEditing',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        'toggleImageCaption',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage'
      ]
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    link: {
      addTargetToExternalLinks: true
    }
  }), []);

  return (
    <div className="space-y-6">
      {/* Top Banner (No page tabs! Navigated directly from Sidebar) */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <PageIcon className="h-6 w-6 text-indigo-600" />
              {corePage.label} Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {corePage.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={corePage.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on Website
            </a>
            <button
              type="button"
              onClick={loadPageData}
              disabled={loading}
              title="Discard unsaved edits and reload from DB"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              title="Reset editor content to original default template"
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Default Template
            </button>
          </div>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alert.text && (
        <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-sm ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {alert.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span>{alert.text}</span>
          </div>
          <button type="button" onClick={() => setAlert({ type: '', text: '' })} title="Dismiss" aria-label="Dismiss">
            <X className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULAR SECTION EDITOR (About Us, Terms & Conditions, Privacy Policy)     */}
      {/* ========================================================================= */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Header Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <PageIcon className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-extrabold text-slate-800">
                Edit {corePage.label}
              </h2>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                form.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${form.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {form.published ? 'Published & Active' : 'Draft / Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {corePage.description}
              {lastSavedTime && (
                <span className="ml-2 font-medium text-slate-400">
                  • Last updated: {new Date(lastSavedTime).toLocaleString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCoreSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow hover:bg-indigo-500 disabled:bg-slate-300 transition cursor-pointer"
            >
              {saving ? <Loader className="h-3.5 w-3.5 animate-spin text-white" /> : <Save className="h-3.5 w-3.5 text-white" />}
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-semibold text-slate-500">Loading page content...</p>
          </div>
        ) : (
          <form onSubmit={handleCoreSave} className="space-y-6 p-6">
            {/* Primary Meta Fields */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Page Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-3.5 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Page Title"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Target URL Slug
                </label>
                <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-600">
                  <span>{corePage.publicUrl}</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Visibility Status
                </label>
                <select
                  value={form.published ? 'active' : 'inactive'}
                  onChange={(e) => setForm(prev => ({ ...prev, published: e.target.value === 'active' }))}
                  className="w-full rounded-md border border-slate-200 px-3.5 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Active (Visible on Website)</option>
                  <option value="inactive">Inactive / Draft</option>
                </select>
              </div>
            </div>

            {/* Modular Section-by-Section Manager */}
            <div className="space-y-6">
              {/* Section Selector Ribbon */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-sky-50/30 to-purple-50/40 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-indigo-600" />
                      <span>Sections Manager ({sortedSections.length} Sections)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select any section below to edit its Sort Order number, layout alignment, image, buttons, and rich content.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewSection}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Section</span>
                  </button>
                </div>

                {/* Section Selector Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {sortedSections.map((sec) => {
                    const isSelected = selectedSectionId === sec.id;
                    const isSecDirty = savedSectionsSnapshot[sec.id] && JSON.stringify(sec) !== savedSectionsSnapshot[sec.id];
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSelectSection(sec.id)}
                        className={`relative p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{sec.sortOrder}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isSecDirty && (
                              <span className="flex h-2.5 w-2.5 relative" title="Unsaved changes in this section">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                              </span>
                            )}
                            <span
                              title={sec.active !== false ? 'Active on website' : 'Hidden'}
                              className={`w-2.5 h-2.5 rounded-full ${sec.active !== false ? 'bg-emerald-400' : 'bg-slate-300'}`}
                            />
                          </div>
                        </div>
                        <p className="font-bold text-xs truncate max-w-full leading-tight">{sec.name}</p>
                        <span className={`text-[10px] mt-1.5 truncate uppercase tracking-wider font-semibold ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}>
                          {sec.layout || 'standard'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Section Editor Card */}
              {currentSection && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                  {/* Section Header Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-extrabold text-sm font-mono border border-indigo-100">
                        #{currentSection.sortOrder}
                      </span>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-800">
                          Editing Section: {currentSection.name}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {currentSection.id}
                        </span>
                      </div>
                    </div>

                    {/* Order Adjustment & Single Section Save */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isCurrentSectionDirty && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Unsaved Changes
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveSingleCurrentSection}
                        disabled={saving}
                        title={`Save only Section #${currentSection.sortOrder} (${currentSection.name})`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-extrabold !text-white shadow-sm transition cursor-pointer disabled:bg-slate-300"
                        style={{ color: '#ffffff' }}
                      >
                        {saving ? <Loader className="h-3.5 w-3.5 animate-spin !text-white" /> : <Save className="h-3.5 w-3.5 !text-white" />}
                        <span className="!text-white font-extrabold">Save Section #{currentSection.sortOrder}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveSection('up')}
                        title="Move this section up in order"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection('down')}
                        title="Move this section down in order"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        Move Down
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCurrentSection}
                        title="Delete this section"
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Section Meta Inputs: Sort Order, Name, Title, Eyebrow, Active */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Sort Order Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentSection.sortOrder}
                        onChange={(e) => updateCurrentSection('sortOrder', Number(e.target.value) || 1)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Lower numbers appear first (1, 2, 3...)
                      </span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Section Label Name
                      </label>
                      <input
                        type="text"
                        value={currentSection.name || ''}
                        onChange={(e) => updateCurrentSection('name', e.target.value)}
                        placeholder="e.g. Terms Intro, Privacy Scope"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Eyebrow / Category Tag
                      </label>
                      <input
                        type="text"
                        value={currentSection.eyebrow || ''}
                        onChange={(e) => updateCurrentSection('eyebrow', e.target.value)}
                        placeholder="e.g. Platform Agreement, User Rights"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Active Status
                      </label>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSection.active !== false}
                          onChange={(e) => updateCurrentSection('active', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {currentSection.active !== false ? 'Show Section on Website' : 'Hide this Section'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Section Heading / Title */}
                  <div>
                    <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Section Heading / Title
                    </label>
                    <input
                      type="text"
                      value={currentSection.title || ''}
                      onChange={(e) => updateCurrentSection('title', e.target.value)}
                      placeholder="e.g. 1. Acceptance of Terms"
                      className="w-full rounded-md border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Section Layout & Background Color */}
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Layout Selector */}
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Section Layout Alignment
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'text-only', label: 'Full Width Text Only' },
                          { id: 'text-left-image-right', label: 'Text Left | Image Right' },
                          { id: 'image-left-text-right', label: 'Image Left | Text Right' },
                          { id: 'centered-stack', label: 'Centered Stack' }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateCurrentSection('layout', opt.id)}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border text-left transition cursor-pointer ${
                              (currentSection.layout || 'text-only') === opt.id
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Section Background Color
                      </label>
                      <div className="flex flex-wrap items-center gap-2 relative">
                        {[
                          { label: 'Pure White', color: '#ffffff' },
                          { label: 'Slate Light (#f8fafc)', color: '#f8fafc' },
                          { label: 'Peach (#fff9f3)', color: '#fff9f3' },
                          { label: 'Soft Blue (#c2d9ff)', color: '#c2d9ff' }
                        ].map((bg) => (
                          <button
                            key={bg.color}
                            type="button"
                            onClick={() => {
                              updateCurrentSection('bgColor', bg.color);
                              setShowColorPicker(false);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              currentSection.bgColor === bg.color
                                ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: bg.color }}
                            />
                            <span>{bg.label}</span>
                          </button>
                        ))}

                        {/* Custom Color Button with DevTools Color Picker Box */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            title="Click to open full color picker palette"
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              showColorPicker
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-xs"
                              style={{
                                background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                              }}
                            />
                            <span>Custom Color</span>
                          </button>

                          {/* Dropdown DevTools Color Picker Box */}
                          {showColorPicker && (
                            <div className="absolute left-0 top-full mt-2 z-50 shadow-2xl">
                              <DevToolsColorPicker
                                color={currentSection.bgColor || '#ffffff'}
                                onChange={(hex) => updateCurrentSection('bgColor', hex)}
                                onClose={() => setShowColorPicker(false)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Hex Input with Live Color Swatch */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-xs focus-within:border-indigo-500">
                          <span className="text-xs font-bold text-slate-400 mr-1">#</span>
                          <input
                            type="text"
                            value={(currentSection.bgColor || '#ffffff').replace(/^#/, '')}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                              updateCurrentSection('bgColor', `#${val}`);
                            }}
                            placeholder="ffffff"
                            maxLength={6}
                            className="w-16 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-200 shadow-inner ml-1.5 shrink-0"
                            style={{ backgroundColor: currentSection.bgColor || '#ffffff' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Image & Spacing Adjustments */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-indigo-600" />
                        <span>Section Image, Spacing &amp; Style</span>
                      </h5>
                      {currentSection.image?.url && (
                        <button
                          type="button"
                          onClick={() => updateCurrentSectionImage('url', '')}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 transition"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
                      {/* Image Upload / Preview & BG Remover */}
                      <div className="lg:col-span-2 flex items-start gap-4">
                        <div
                          className="w-24 h-24 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs"
                          style={{
                            backgroundImage: currentSection.image?.transparentBg ? `
                              linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                              linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                              linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                            ` : 'none',
                            backgroundSize: '8px 8px'
                          }}
                        >
                          {currentSection.image?.url ? (
                            <img
                              src={resolveCmsImageUrl(currentSection.image.url)}
                              alt={currentSection.image?.alt || 'Section Image'}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold text-center">
                              No Image (Optional)
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 flex-grow">
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              className="btn-label inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold !text-white shadow-xs cursor-pointer transition"
                              style={{ color: '#ffffff' }}
                            >
                              <Upload className={`h-3.5 w-3.5 !text-white ${uploadingBanner ? 'animate-spin' : ''}`} style={{ color: '#ffffff' }} />
                              <span className="!text-white font-bold" style={{ color: '#ffffff' }}>
                                {currentSection.image?.url ? 'Replace Image' : 'Upload Image'}
                              </span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => handleUploadSectionImage(e.target.files?.[0])}
                                disabled={uploadingBanner}
                              />
                            </label>

                            {/* Magic Background Remover Button */}
                            {currentSection.image?.url && (
                              <button
                                type="button"
                                onClick={() => setBgRemoverOpen(true)}
                                title="Remove black/white background from this image"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 px-3 py-2 text-xs font-bold !text-white shadow-xs cursor-pointer transition"
                                style={{ color: '#ffffff' }}
                              >
                                <Wand2 className="h-3.5 w-3.5 !text-white" style={{ color: '#ffffff' }} />
                                <span className="!text-white font-bold" style={{ color: '#ffffff' }}>
                                  Remove Background
                                </span>
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500">
                            Supports transparent PNG, SVG, JPG, WEBP (Max 5 MB)
                          </p>

                          <div className="flex flex-col gap-1.5 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(currentSection.image?.transparentBg)}
                                onChange={(e) => updateCurrentSectionImage('transparentBg', e.target.checked)}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                              />
                              <span className="text-xs font-medium text-slate-700">
                                Transparent / Background Removed (No Card Shadow)
                              </span>
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-500">Instant Blend:</span>
                              <select
                                value={currentSection.image?.blendMode || 'normal'}
                                onChange={(e) => updateCurrentSectionImage('blendMode', e.target.value)}
                                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                              >
                                <option value="normal">Normal</option>
                                <option value="screen">Screen (Hides Black BG)</option>
                                <option value="multiply">Multiply (Hides White BG)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Spacing Above & Below */}
                      <div>
                        <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          Spacing Above Image
                        </label>
                        <select
                          value={[0, 1, 2, 3, 4].includes(Number(currentSection.image?.spacingTop)) ? String(currentSection.image?.spacingTop) : 'custom'}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              updateCurrentSectionImage('spacingTop', currentSection.image?.spacingTop > 4 ? currentSection.image.spacingTop : 5);
                            } else {
                              updateCurrentSectionImage('spacingTop', Number(e.target.value));
                            }
                          }}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="0">0 lines (Default)</option>
                          <option value="1">1 line spacing</option>
                          <option value="2">2 lines spacing</option>
                          <option value="3">3 lines spacing</option>
                          <option value="4">4 lines spacing</option>
                          <option value="custom">Custom lines (Type below)...</option>
                        </select>
                        {(![0, 1, 2, 3, 4].includes(Number(currentSection.image?.spacingTop))) && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={currentSection.image?.spacingTop || 0}
                              onChange={(e) => updateCurrentSectionImage('spacingTop', Number(e.target.value) || 0)}
                              className="w-16 rounded border border-indigo-300 bg-white px-2 py-1 text-xs font-bold font-mono focus:border-indigo-500 focus:outline-none"
                            />
                            <span className="text-[11px] text-slate-500 font-semibold">custom lines</span>
                          </div>
                        )}

                        <label className="mt-3 mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          Spacing Below Image
                        </label>
                        <select
                          value={[0, 1, 2, 3, 4].includes(Number(currentSection.image?.spacingBottom)) ? String(currentSection.image?.spacingBottom) : 'custom'}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              updateCurrentSectionImage('spacingBottom', currentSection.image?.spacingBottom > 4 ? currentSection.image.spacingBottom : 5);
                            } else {
                              updateCurrentSectionImage('spacingBottom', Number(e.target.value));
                            }
                          }}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="0">0 lines (Default)</option>
                          <option value="1">1 line spacing</option>
                          <option value="2">2 lines spacing</option>
                          <option value="3">3 lines spacing</option>
                          <option value="4">4 lines spacing</option>
                          <option value="custom">Custom lines (Type below)...</option>
                        </select>
                        {(![0, 1, 2, 3, 4].includes(Number(currentSection.image?.spacingBottom))) && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={currentSection.image?.spacingBottom || 0}
                              onChange={(e) => updateCurrentSectionImage('spacingBottom', Number(e.target.value) || 0)}
                              className="w-16 rounded border border-indigo-300 bg-white px-2 py-1 text-xs font-bold font-mono focus:border-indigo-500 focus:outline-none"
                            />
                            <span className="text-[11px] text-slate-500 font-semibold">custom lines</span>
                          </div>
                        )}
                      </div>

                      {/* Image Width & Corner Style */}
                      <div>
                        <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          Image Size / Width
                        </label>
                        <select
                          value={['small', 'medium', 'large', 'full'].includes(currentSection.image?.width) ? currentSection.image.width : 'custom'}
                          onChange={(e) => updateCurrentSectionImage('width', e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="small">Small (280px)</option>
                          <option value="medium">Medium (440px)</option>
                          <option value="large">Large (580px)</option>
                          <option value="full">Full Width (100%)</option>
                          <option value="custom">Custom Width (px)...</option>
                        </select>
                        {currentSection.image?.width === 'custom' && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <input
                              type="number"
                              min="50"
                              max="1600"
                              value={currentSection.image?.customWidth || 400}
                              onChange={(e) => updateCurrentSectionImage('customWidth', Number(e.target.value) || 400)}
                              className="w-20 rounded border border-indigo-300 bg-white px-2 py-1 text-xs font-bold font-mono focus:border-indigo-500 focus:outline-none"
                              placeholder="400"
                            />
                            <span className="text-[11px] text-slate-500 font-semibold">px width</span>
                          </div>
                        )}

                        <label className="mt-3 mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          Image Corner Style
                        </label>
                        <select
                          value={currentSection.image?.rounded || 'rounded-xl'}
                          onChange={(e) => updateCurrentSectionImage('rounded', e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="rounded-none">Square (No curve)</option>
                          <option value="rounded-lg">Rounded (8px)</option>
                          <option value="rounded-xl">Medium Rounded (12px)</option>
                          <option value="rounded-2xl">Large Rounded (16px)</option>
                          <option value="rounded-custom">Curved Pill (Original Design)</option>
                          <option value="rounded-full">Circular</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section Buttons Settings */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Section Action Buttons
                    </h5>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Primary Button */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(currentSection.primaryButton?.enabled)}
                            onChange={(e) => updateCurrentSectionButton('primaryButton', 'enabled', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-800">Show Primary Button</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={currentSection.primaryButton?.text || ''}
                            onChange={(e) => updateCurrentSectionButton('primaryButton', 'text', e.target.value)}
                            placeholder="Button Text (e.g. Learn More)"
                            className="rounded border border-slate-200 px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={currentSection.primaryButton?.url || ''}
                            onChange={(e) => updateCurrentSectionButton('primaryButton', 'url', e.target.value)}
                            placeholder="Target Link (e.g. /contact)"
                            className="rounded border border-slate-200 px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Secondary Button */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(currentSection.secondaryButton?.enabled)}
                            onChange={(e) => updateCurrentSectionButton('secondaryButton', 'enabled', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-800">Show Secondary Button</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={currentSection.secondaryButton?.text || ''}
                            onChange={(e) => updateCurrentSectionButton('secondaryButton', 'text', e.target.value)}
                            placeholder="Button Text (e.g. Support)"
                            className="rounded border border-slate-200 px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={currentSection.secondaryButton?.url || ''}
                            onChange={(e) => updateCurrentSectionButton('secondaryButton', 'url', e.target.value)}
                            placeholder="Target Link (e.g. /support)"
                            className="rounded border border-slate-200 px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Rich Content with CKEditor 5 */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-extrabold text-slate-800">
                        Section Text &amp; Rich Content (CKEditor 5)
                      </label>
                      <span className="text-xs font-semibold text-slate-400">
                        Customize paragraphs, headings, bullet points, and formatting for this section.
                      </span>
                    </div>
                    <div className="cms-ckeditor rounded-md border border-slate-200 overflow-hidden shadow-sm">
                      <CKEditor
                        key={currentSection.id}
                        editor={ClassicEditor}
                        config={editorConfig}
                        data={currentSection.contentHtml || ''}
                        onChange={(_, editor) => {
                          const html = editor.getData();
                          updateCurrentSection('contentHtml', html);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEO Meta Configuration */}
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <Search className="h-4 w-4 text-indigo-600" />
                SEO &amp; Meta Information
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">SEO Meta Title</label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="Custom page title for search engines"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">SEO Meta Description</label>
                  <input
                    type="text"
                    value={form.seoDescription}
                    onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Brief page summary for search engine results"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">SEO Keywords</label>
                  <input
                    type="text"
                    value={form.seoKeywords}
                    onChange={(e) => setForm(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder="Comma-separated keywords"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Submit Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-extrabold text-white shadow hover:bg-indigo-500 disabled:bg-slate-300 transition cursor-pointer"
              >
                {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving Changes...' : 'Save & Publish Changes'}
              </button>

              <a
                href={corePage.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ExternalLink className="h-4 w-4" />
                Preview on Website
              </a>
            </div>
          </form>
        )}
      </section>

      {/* ========================================================================= */}
      {/* CENTERED SUCCESS NOTIFICATION MODAL                                       */}
      {/* ========================================================================= */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center border border-slate-100 transform transition-all scale-100">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9 stroke-[2.3]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              {successModalData.title || 'Saved Successfully!'}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {successModalData.message || 'All your edits have been saved to the database and are now live on the website.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition cursor-pointer"
              >
                Continue Editing
              </button>

              {successModalData.url && (
                <a
                  href={successModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Live</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CENTERED UNSAVED CHANGES WARNING MODAL                                    */}
      {/* ========================================================================= */}
      {showUnsavedWarningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUnsavedWarningModal(false);
              setPendingTargetSectionId(null);
            }
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 text-center border border-amber-200 transform transition-all scale-100">
            <button
              type="button"
              onClick={() => {
                setShowUnsavedWarningModal(false);
                setPendingTargetSectionId(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Close and stay on current section"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
              <AlertCircle className="w-9 h-9 stroke-[2.3]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              Unsaved Changes in Section #{currentSection?.sortOrder}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Aapne <strong className="text-slate-800">Section #{currentSection?.sortOrder} ({currentSection?.name})</strong> me edits kiye hain jo abhi save nahi huye hain. Dusre section par jaane se pehle decide karein:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2.5">
              <button
                type="button"
                onClick={handleDismissUnsavedChanges}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Dismiss &amp; Revert</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
                style={{ color: '#ffffff' }}
              >
                <Save className="w-4 h-4 text-white" />
                <span className="text-white font-extrabold">Save &amp; Continue</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUnsavedWarningModal(false);
                  setPendingTargetSectionId(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Magic Background Remover Modal */}
      <MagicBgRemoverModal
        isOpen={bgRemoverOpen}
        imageUrl={currentSection?.image?.url}
        onClose={() => setBgRemoverOpen(false)}
        onSuccess={handleBgRemovalSuccess}
        showAlert={showAlert}
      />
    </div>
  );
};

export default CorePageCMS;
