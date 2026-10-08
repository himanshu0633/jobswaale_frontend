import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
  ClipboardList,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Layout,
  Loader,
  Palette,
  Pipette,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
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

const defaultNewPageContent = '<section><h2>New Page</h2><p>Start writing your page content here...</p></section>';

const CORE_PAGES = [
  {
    key: 'about',
    label: 'About Us',
    slug: 'about',
    publicUrl: '/about',
    icon: Building,
    defaultTitle: 'About Us',
    defaultContent: DEFAULT_ABOUT_CONTENT,
    description: 'Company introduction, mission, vision, values, and section-by-section content.'
  },
  {
    key: 'terms',
    label: 'Terms & Conditions',
    slug: 'terms-conditions',
    publicUrl: '/terms-conditions',
    icon: Scale,
    defaultTitle: 'Terms & Conditions',
    defaultContent: DEFAULT_TERMS_CONTENT,
    description: 'Terms of service, platform policies, user and employer agreements, and section-by-section rules.'
  },
  {
    key: 'privacy',
    label: 'Privacy Policy',
    slug: 'privacy-policy',
    publicUrl: '/privacy-policy',
    icon: Shield,
    defaultTitle: 'Privacy Policy',
    defaultContent: DEFAULT_PRIVACY_CONTENT,
    description: 'Data collection practices, security, user privacy rights, cookies, and modular clauses.'
  }
];

const getDefaultSectionsForCorePage = (pageKey) => {
  if (pageKey === 'about') return DEFAULT_ABOUT_SECTIONS;
  if (pageKey === 'terms') return DEFAULT_TERMS_SECTIONS;
  if (pageKey === 'privacy') return DEFAULT_PRIVACY_SECTIONS;
  return [];
};

const createBlankForm = () => ({
  title: '',
  slug: '',
  parentPage: '',
  published: true,
  featuredImage: '',
  bannerImage: '',
  banners: [],
  sections: [],
  sortingOrder: 10,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  contentHtml: defaultNewPageContent,
  projectData: { editor: 'ckeditor', html: defaultNewPageContent }
});

const slugify = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/') || 'page'
);

const statusLabel = (published) => published ? 'Active' : 'Inactive';

export const CMSPages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'about';

  const [activeTab, setActiveTab] = useState(initialTab); // 'about' | 'terms' | 'privacy' | 'all'
  const [view, setView] = useState('list'); // 'list' | 'form' (used under 'all' tab)
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingCorePage, setLoadingCorePage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(createBlankForm);
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [hasDbRecord, setHasDbRecord] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Modular Sections State for Core Pages (About, Terms, Privacy)
  const [selectedSectionId, setSelectedSectionId] = useState('hero');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bgRemoverOpen, setBgRemoverOpen] = useState(false);
  const [savedSectionsSnapshot, setSavedSectionsSnapshot] = useState({});
  const [showUnsavedWarningModal, setShowUnsavedWarningModal] = useState(false);
  const [pendingTargetSectionId, setPendingTargetSectionId] = useState(null);

  // Centered Success Notification Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '', url: '' });

  const activeCorePage = useMemo(() => {
    return CORE_PAGES.find(p => p.key === activeTab) || null;
  }, [activeTab]);

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
      } else if (targetToSwitch.startsWith('__tab__:')) {
        const nextTab = targetToSwitch.replace('__tab__:', '');
        setActiveTab(nextTab);
        setSearchParams({ tab: nextTab });
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
      } else if (targetToSwitch.startsWith('__tab__:')) {
        const nextTab = targetToSwitch.replace('__tab__:', '');
        setActiveTab(nextTab);
        setSearchParams({ tab: nextTab });
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
      primaryButton: {
        enabled: true,
        text: 'Learn More',
        url: '/jobs',
        style: 'primary'
      },
      secondaryButton: {
        enabled: false,
        text: '',
        url: '',
        style: 'secondary'
      },
      bgColor: '#ffffff'
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
    setShowColorPicker(false);
    showAlert('success', `New section added (#${nextOrder})! You can now adjust its layout, image, and text.`);
  };

  // Add a new section guarded by unsaved changes check
  const handleAddNewSection = () => {
    if (isCurrentSectionDirty) {
      setPendingTargetSectionId('__new__');
      setShowUnsavedWarningModal(true);
      return;
    }
    executeAddNewSection();
  };

  // Delete the currently selected section
  const handleDeleteCurrentSection = () => {
    if (!currentSection) return;
    if (form.sections.length <= 1) {
      showAlert('error', 'You must have at least one section on the page.');
      return;
    }
    if (window.confirm(`Delete section "${currentSection.name}"?`)) {
      const remaining = form.sections.filter(s => s.id !== currentSection.id);
      setForm(prev => ({ ...prev, sections: remaining }));
      setSelectedSectionId(remaining[0]?.id || '');
      showAlert('success', 'Section removed.');
    }
  };

  // Fetch all custom CMS pages for the table
  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages`, {
        headers: getAuthHeaders()
      });
      setPages(Array.isArray(res.data) ? res.data : (res.data?.docs || []));
    } catch (err) {
      console.warn('Could not load custom pages list:', err);
    } finally {
      setLoadingPages(false);
    }
  };

  // Fetch a core page by slug
  const loadCorePage = async (corePage) => {
    if (!corePage) return;
    setLoadingCorePage(true);
    setAlert({ type: '', text: '' });

    try {
      let pageData = null;

      // 1. Try admin endpoint first
      try {
        const res = await axios.get(`${BASE_API_URL}/cms/pages/by-slug/${corePage.slug}`, {
          headers: getAuthHeaders()
        });
        if (res.data) pageData = res.data;
      } catch (adminErr) {
        // Fallback to public endpoint
        try {
          const pubRes = await axios.get(`${BASE_API_URL}/cms/public/pages/${corePage.slug}`);
          if (pubRes.data) pageData = pubRes.data;
        } catch {
          pageData = null;
        }
      }

      const defaultSections = getDefaultSectionsForCorePage(corePage.key);

      if (pageData) {
        setHasDbRecord(true);
        setEditingId(pageData._id || null);
        setLastSavedTime(pageData.updatedAt || pageData.createdAt || null);
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
        setHasDbRecord(false);
        setEditingId(null);
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
      setLoadingCorePage(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // When tab changes, load appropriate data
  useEffect(() => {
    if (activeCorePage) {
      loadCorePage(activeCorePage);
    } else if (activeTab === 'all') {
      setView('list');
      setAlert({ type: '', text: '' });
    }
  }, [activeTab]);

  const handleTabSwitch = (tabKey) => {
    if (tabKey === activeTab) return;
    if (isCurrentSectionDirty) {
      setPendingTargetSectionId(`__tab__:${tabKey}`);
      setShowUnsavedWarningModal(true);
      return;
    }
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
    setAlert({ type: '', text: '' });
  };

  const handleResetToDefault = () => {
    if (!activeCorePage) return;
    if (window.confirm(`Reset "${activeCorePage.label}" content to the standard default template? Any unsaved edits will be lost.`)) {
      const defaultSections = getDefaultSectionsForCorePage(activeCorePage.key);
      setForm(prev => ({
        ...prev,
        contentHtml: activeCorePage.defaultContent,
        title: activeCorePage.defaultTitle,
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

  const handleReloadFromDb = () => {
    if (activeCorePage) {
      loadCorePage(activeCorePage);
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

  const handleAddBanner = async (file, defaultPos = 'top-center') => {
    if (!file) return;
    setUploadingBanner(true);
    setAlert({ type: '', text: '' });
    try {
      const uploadedUrl = await handleUploadBannerFile(file);
      if (!uploadedUrl) return;

      const newBanner = {
        rawUrl: uploadedUrl,
        url: resolveCmsImageUrl(uploadedUrl),
        position: defaultPos,
        title: '',
        alt: ''
      };

      setForm(prev => {
        const nextBanners = [...(prev.banners || []), newBanner];
        return {
          ...prev,
          banners: nextBanners,
          bannerImage: nextBanners[0]?.rawUrl || nextBanners[0]?.url || '',
          featuredImage: nextBanners[0]?.rawUrl || nextBanners[0]?.url || ''
        };
      });

      showAlert('success', 'Banner image uploaded successfully! Choose position and click "Save & Publish Changes" to apply.');
    } catch (err) {
      console.error('Banner upload failed:', err);
      showAlert('error', err.response?.data?.message || err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleReplaceBanner = async (index, file) => {
    if (!file) return;
    setUploadingBanner(true);
    setAlert({ type: '', text: '' });
    try {
      const uploadedUrl = await handleUploadBannerFile(file);
      if (!uploadedUrl) return;

      setForm(prev => {
        const nextBanners = [...(prev.banners || [])];
        if (nextBanners[index]) {
          nextBanners[index] = {
            ...nextBanners[index],
            rawUrl: uploadedUrl,
            url: resolveCmsImageUrl(uploadedUrl)
          };
        }
        return {
          ...prev,
          banners: nextBanners,
          bannerImage: nextBanners[0]?.rawUrl || nextBanners[0]?.url || '',
          featuredImage: nextBanners[0]?.rawUrl || nextBanners[0]?.url || ''
        };
      });

      showAlert('success', 'Banner image replaced successfully! Click "Save & Publish Changes" to apply.');
    } catch (err) {
      console.error('Banner replace failed:', err);
      showAlert('error', err.response?.data?.message || err.message || 'Image replace failed. Please try again.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerPositionChange = (index, newPos) => {
    setForm(prev => {
      const nextBanners = [...(prev.banners || [])];
      if (nextBanners[index]) {
        nextBanners[index] = {
          ...nextBanners[index],
          position: newPos
        };
      }
      return {
        ...prev,
        banners: nextBanners
      };
    });
  };

  const handleRemoveBanner = (index) => {
    if (window.confirm('Remove this banner? Click "Save & Publish Changes" afterwards to update the live website.')) {
      setForm(prev => {
        const nextBanners = (prev.banners || []).filter((_, i) => i !== index);
        return {
          ...prev,
          banners: nextBanners,
          bannerImage: nextBanners[0]?.rawUrl || nextBanners[0]?.url || '',
          featuredImage: nextBanners[0]?.rawUrl || nextBanners[0]?.url || ''
        };
      });
      showAlert('success', 'Banner removed from form. Click "Save & Publish Changes" to apply.');
    }
  };

  const handleCoreSave = async (e) => {
    if (e) e.preventDefault();
    if (!activeCorePage) return;

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
      title: form.title.trim() || activeCorePage.defaultTitle,
      slug: activeCorePage.slug,
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
        `${BASE_API_URL}/cms/pages/by-slug/${activeCorePage.slug}`,
        payload,
        { headers: getAuthHeaders() }
      );

      const savedData = res.data;
      setHasDbRecord(true);
      setEditingId(savedData._id || null);
      setLastSavedTime(savedData.updatedAt || new Date().toISOString());

      const nextSnapshots = {};
      cleanSections.forEach(s => { nextSnapshots[s.id] = JSON.stringify(s); });
      setSavedSectionsSnapshot(nextSnapshots);

      // Trigger the prominent centered notification modal
      setSuccessModalData({
        title: `"${activeCorePage.label}" Saved Successfully!`,
        message: `All sections, layouts, sort order numbers, images, and content for "${activeCorePage.label}" have been saved and updated live on the website.`,
        url: activeCorePage.publicUrl
      });
      setShowSuccessModal(true);

      // Refresh custom pages list in background
      fetchPages();
    } catch (err) {
      console.error('Error saving page:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save ONLY the currently active section to database and show prominent notification
  const handleSaveSingleCurrentSection = async () => {
    if (!currentSection || !activeCorePage) return;
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
        title: form.title || activeCorePage.defaultTitle,
        slug: activeCorePage.slug,
        parentPage: null,
        published: form.published !== false,
        html: contentHtml,
        projectData: { editor: 'ckeditor', html: contentHtml },
        bannerImage: primaryBanner,
        featuredImage: primaryBanner,
        banners: bannersToSend,
        sections: cleanSections,
        sortingOrder: Number(form.sortingOrder) || 10,
        seoTitle: form.seoTitle || `${activeCorePage.defaultTitle} - JobsWaale`,
        seoDescription: form.seoDescription || activeCorePage.description,
        seoKeywords: form.seoKeywords || `${activeCorePage.defaultTitle}, JobsWaale, career`
      };

      const res = await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/${activeCorePage.slug}`,
        payload,
        { headers: getAuthHeaders() }
      );

      const savedData = res.data;
      setHasDbRecord(true);
      setEditingId(savedData._id || null);
      setLastSavedTime(savedData.updatedAt || new Date().toISOString());

      // Update snapshot for currentSection so it is marked saved/clean
      setSavedSectionsSnapshot(prev => ({
        ...prev,
        [currentSection.id]: JSON.stringify(currentSection)
      }));

      // Show Centered Notification Modal specifically naming page and Section Sort Order
      setSuccessModalData({
        title: `Section #${currentSection.sortOrder} Saved Successfully!`,
        message: `"${activeCorePage.defaultTitle || activeCorePage.label}" - Section #${currentSection.sortOrder} has been saved and updated live on the website.`,
        url: activeCorePage.publicUrl
      });
      setShowSuccessModal(true);
      fetchPages();
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

  // Custom pages table handlers
  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(page => (
      page.title?.toLowerCase().includes(q) ||
      page.slug?.toLowerCase().includes(q) ||
      page.parentPage?.title?.toLowerCase().includes(q)
    ));
  }, [pages, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / entriesPerPage));
  const visiblePages = filteredPages.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleNewCustomPage = () => {
    setEditingId(null);
    const next = createBlankForm();
    next.sortingOrder = pages.length ? (Math.max(...pages.map(p => Number(p.sortingOrder) || 10)) + 1) : 10;
    setForm(next);
    setView('form');
    setAlert({ type: '', text: '' });
  };

  const handleEditCustomPage = async (page) => {
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/${page._id}`, {
        headers: getAuthHeaders()
      });
      const data = res.data;
      const bannersList = getPageBanners(data);
      const primaryBanner = bannersList[0]?.rawUrl || data.featuredImage || data.bannerImage || '';
      setEditingId(data._id);
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        parentPage: data.parentPage?._id || data.parentPage || '',
        published: data.published !== false,
        featuredImage: primaryBanner,
        bannerImage: primaryBanner,
        banners: bannersList,
        sections: Array.isArray(data.sections) ? data.sections : [],
        sortingOrder: data.sortingOrder || 10,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
        contentHtml: data.html || defaultNewPageContent,
        projectData: data.projectData || { editor: 'ckeditor', html: data.html || defaultNewPageContent }
      });
      setView('form');
      setAlert({ type: '', text: '' });
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page could not be opened.');
    }
  };

  const handleDeleteCustomPage = async (page) => {
    if (!window.confirm(`Delete page "${page.title}"?`)) return;
    try {
      await axios.delete(`${BASE_API_URL}/cms/pages/${page._id}`, {
        headers: getAuthHeaders()
      });
      showAlert('success', 'Page deleted successfully.');
      fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page could not be deleted.');
    }
  };

  const handleSaveCustomPage = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showAlert('error', 'Page Title is required.');
      return;
    }

    setSaving(true);
    const contentHtml = form.contentHtml || '';
    const bannersToSend = (form.banners || []).map(b => ({
      url: b.rawUrl || b.url,
      position: b.position || 'top-center',
      title: b.title || '',
      alt: b.alt || ''
    }));
    const primaryBanner = bannersToSend[0]?.url || form.featuredImage || form.bannerImage || '';
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      parentPage: form.parentPage || null,
      published: form.published,
      featuredImage: primaryBanner,
      bannerImage: primaryBanner,
      banners: bannersToSend,
      sections: form.sections || [],
      sortingOrder: Number(form.sortingOrder) || 10,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      projectData: { editor: 'ckeditor', html: contentHtml },
      html: contentHtml,
      css: ''
    };

    try {
      let savedSlug = '';
      if (editingId) {
        const res = await axios.put(`${BASE_API_URL}/cms/pages/${editingId}`, payload, {
          headers: getAuthHeaders()
        });
        savedSlug = res.data.slug;
        setForm(prev => ({ ...prev, slug: res.data.slug }));
      } else {
        const res = await axios.post(`${BASE_API_URL}/cms/pages`, payload, {
          headers: getAuthHeaders()
        });
        savedSlug = res.data.slug;
        setEditingId(res.data._id);
        setForm(prev => ({ ...prev, slug: res.data.slug }));
      }

      setSuccessModalData({
        title: `Page "${form.title}" Saved Successfully!`,
        message: 'Custom CMS page content and settings have been saved and updated live.',
        url: `/${savedSlug}`
      });
      setShowSuccessModal(true);
      await fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Could not save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCustomPageImageUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('error', 'Only JPG, PNG, GIF, and WEBP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Image cannot exceed 5 MB limit.');
      return;
    }

    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      const uploadedUrl = res.data?.imageUrl || res.data?.url || res.data?.default;
      setForm(prev => {
        const nextBanners = [{
          rawUrl: uploadedUrl,
          url: resolveCmsImageUrl(uploadedUrl),
          position: 'top-center',
          title: '',
          alt: ''
        }];
        return {
          ...prev,
          featuredImage: uploadedUrl,
          bannerImage: uploadedUrl,
          banners: nextBanners
        };
      });
      showAlert('success', 'Banner image uploaded successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message || 'Image upload failed.');
    } finally {
      setUploadingBanner(false);
    }
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
      {/* Top Banner & Tab Navigation */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              Website Content Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Easily edit modular sections, images, layout, and rich content for About Us, Terms &amp; Conditions, and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CORE_PAGES.map((core) => {
            const Icon = core.icon;
            const isSelected = activeTab === core.key;
            return (
              <button
                key={core.key}
                type="button"
                onClick={() => handleTabSwitch(core.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                    : 'bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{core.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {core.publicUrl}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleTabSwitch('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                : 'bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <ClipboardList className={`h-4 w-4 ${activeTab === 'all' ? 'text-white' : 'text-slate-500'}`} />
            <span>All Custom Pages</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {pages.length}
            </span>
          </button>
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
      {/* CORE PAGES MODULAR SECTION EDITOR (About Us, Terms & Conditions, Privacy Policy) */}
      {/* ========================================================================= */}
      {activeCorePage && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Header Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <activeCorePage.icon className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-extrabold text-slate-800">
                  Edit {activeCorePage.label}
                </h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  form.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${form.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {form.published ? 'Published & Active' : 'Draft / Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeCorePage.description}
                {lastSavedTime && (
                  <span className="ml-2 font-medium text-slate-400">
                    • Last updated: {new Date(lastSavedTime).toLocaleString()}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={activeCorePage.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View on Website
              </a>
              <button
                type="button"
                onClick={handleReloadFromDb}
                disabled={loadingCorePage}
                title="Discard unsaved edits and reload from DB"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${loadingCorePage ? 'animate-spin' : ''}`} />
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

          {loadingCorePage ? (
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
                    <span>{activeCorePage.publicUrl}</span>
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

              {/* Modular Section-by-Section Manager for ALL core pages (About, Terms, Privacy) */}
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

                          {/* Custom Color Button with Exact DevTools Color Picker Box */}
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
                              {/* Upload/Replace Button with high contrast visible text */}
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

                        {/* Spacing Above & Below (Lines adjustment + Custom lines) */}
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
                  href={activeCorePage.publicUrl}
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
      )}

      {/* ========================================================================= */}
      {/* CASE 2: CUSTOM PAGES MANAGEMENT (TABLE LISTING OR CUSTOM FORM)            */}
      {/* ========================================================================= */}
      {activeTab === 'all' && (
        <>
          {view === 'list' ? (
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-extrabold text-slate-800">All CMS Pages Listing</h2>
                <button
                  onClick={handleNewCustomPage}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-indigo-500 transition cursor-pointer"
                >
                  <CirclePlus className="h-4 w-4" />
                  Add New Custom Page
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    entries per page
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    Search:
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search title, slug..."
                      className="w-56 rounded border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border border-slate-100 text-left text-sm">
                    <thead className="bg-slate-50 font-bold text-slate-700">
                      <tr>
                        <th className="border-r border-slate-100 px-4 py-3.5">Title</th>
                        <th className="border-r border-slate-100 px-4 py-3.5">Slug</th>
                        <th className="border-r border-slate-100 px-4 py-3.5">Parent Page</th>
                        <th className="border-r border-slate-100 px-4 py-3.5">Status</th>
                        <th className="border-r border-slate-100 px-4 py-3.5">Order</th>
                        <th className="px-4 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingPages ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center">
                            <Loader className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                          </td>
                        </tr>
                      ) : visiblePages.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                            No custom pages found.
                          </td>
                        </tr>
                      ) : (
                        visiblePages.map((page) => (
                          <tr key={page._id} className="border-t border-slate-100 odd:bg-slate-50/60 hover:bg-indigo-50/30 transition">
                            <td className="border-r border-slate-100 px-4 py-3.5 font-semibold text-slate-800">
                              {page.title}
                            </td>
                            <td className="border-r border-slate-100 px-4 py-3.5 font-mono text-xs text-rose-500">
                              /{page.slug === 'home' ? '' : page.slug}
                            </td>
                            <td className="border-r border-slate-100 px-4 py-3.5 text-slate-500">
                              {page.parentPage?.title || '—'}
                            </td>
                            <td className="border-r border-slate-100 px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                                page.published !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${page.published !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {statusLabel(page.published !== false)}
                              </span>
                            </td>
                            <td className="border-r border-slate-100 px-4 py-3.5 font-mono text-xs text-slate-500">
                              {page.sortingOrder || 10}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={`/${page.slug === 'home' ? '' : page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Live"
                                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                                <button
                                  onClick={() => handleEditCustomPage(page)}
                                  title="Edit"
                                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomPage(page)}
                                  title="Delete"
                                  className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
                  <span>
                    Showing {filteredPages.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{' '}
                    {Math.min(currentPage * entriesPerPage, filteredPages.length)} of {filteredPages.length} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* Custom Page Form */
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="text-base font-extrabold text-slate-800">
                  {editingId ? `Edit Custom Page` : 'Add New Custom Page'}
                </h2>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Back to List
                </button>
              </div>

              <form onSubmit={handleSaveCustomPage} className="space-y-6 p-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Title *</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Page Title"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Slug</label>
                      <input
                        value={form.slug}
                        onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="Leave blank to auto-generate from title"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Parent Page</label>
                      <select
                        value={form.parentPage}
                        onChange={(e) => setForm(prev => ({ ...prev, parentPage: e.target.value }))}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">None</option>
                        {pages.filter(p => p._id !== editingId).map(p => (
                          <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Page Content (CKEditor 5) *</label>
                      <div className="cms-ckeditor rounded border border-slate-200 overflow-hidden shadow-sm">
                        <CKEditor
                          editor={ClassicEditor}
                          config={editorConfig}
                          data={form.contentHtml}
                          onChange={(_, editor) => {
                            const html = editor.getData();
                            setForm(prev => ({ ...prev, contentHtml: html }));
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold">SEO Title</label>
                      <input
                        value={form.seoTitle}
                        onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder="Meta SEO Title"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">SEO Description</label>
                      <textarea
                        value={form.seoDescription}
                        onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                        placeholder="Meta SEO Description"
                        rows={2}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">SEO Keywords</label>
                      <input
                        value={form.seoKeywords}
                        onChange={(e) => setForm(prev => ({ ...prev, seoKeywords: e.target.value }))}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <aside className="space-y-5">
                    <div className="rounded bg-slate-100 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Settings
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Featured Image/Banner</label>
                      <div className="space-y-2">
                        {form.featuredImage ? (
                          <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-2">
                            <img
                              src={resolveCmsImageUrl(form.featuredImage)}
                              alt="Featured preview"
                              className="w-full h-32 object-cover rounded"
                            />
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <label className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                                <RefreshCw className={`h-3 w-3 ${uploadingBanner ? 'animate-spin' : ''}`} />
                                Change Image
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif"
                                  className="hidden"
                                  onChange={(e) => handleCustomPageImageUpload(e.target.files?.[0])}
                                  disabled={uploadingBanner}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, featuredImage: '', bannerImage: '', banners: [] }))}
                                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-sm font-semibold text-slate-600 hover:border-indigo-500 hover:bg-indigo-50/20 transition ${uploadingBanner ? 'border-indigo-400 bg-indigo-50/50' : ''}`}>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              className="hidden"
                              onChange={(e) => handleCustomPageImageUpload(e.target.files?.[0])}
                              disabled={uploadingBanner}
                            />
                            {uploadingBanner ? (
                              <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                            ) : (
                              <>
                                <ImagePlus className="mb-1 h-5 w-5 text-indigo-600" />
                                <span>Upload Page Banner</span>
                                <span className="text-[11px] text-slate-400 font-normal">JPG, PNG, WEBP, max 5MB</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Sorting Order</label>
                      <input
                        type="number"
                        value={form.sortingOrder}
                        onChange={(e) => setForm(prev => ({ ...prev, sortingOrder: e.target.value }))}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold">Status</label>
                      <select
                        value={form.published ? 'active' : 'inactive'}
                        onChange={(e) => setForm(prev => ({ ...prev, published: e.target.value === 'active' }))}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </aside>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-indigo-500 disabled:bg-slate-300 cursor-pointer"
                  >
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* PROMINENT CENTERED SUCCESS NOTIFICATION MODAL                              */}
      {/* ========================================================================= */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center border border-slate-100 transform transition-all scale-100">
            {/* Top Right Close Button */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Green Animated Ring & Checkmark */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2">
              {successModalData.title || 'Saved Successfully!'}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {successModalData.message || 'Page changes and section configurations have been saved and are now live on the website.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {successModalData.url && (
                <a
                  href={successModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition cursor-pointer"
                >
                  <span>View Live Page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                Done
              </button>
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
            {/* Top Right Close Button */}
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

            {/* Warning Ring & Amber Icon */}
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
              <AlertCircle className="w-9 h-9 stroke-[2.3]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              Unsaved Changes in Section #{currentSection?.sortOrder}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Aapne <strong className="text-slate-800">Section #{currentSection?.sortOrder} ({currentSection?.name})</strong> me edits kiye hain jo abhi save nahi huye hain. Dusre section ya page par jaane se pehle decide karein:
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

export default CMSPages;
