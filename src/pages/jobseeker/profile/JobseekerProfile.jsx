import { useState } from 'react';
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  X,
  XCircle
} from 'lucide-react';

const suggestedCities = [
  'Hamirpur',
  'Chandigarh',
  'Mohali',
  'Delhi NCR',
  'Bangalore',
  'Pune',
  'Mumbai',
  'Hyderabad',
  'Chennai',
  'Ahmedabad',
  'Jaipur',
  'Lucknow'
];

const initialSkills = [
  'JavaScript',
  'React',
  'HTML/CSS',
  'Bootstrap',
  'Tailwind CSS',
  'Git'
];

const initialLocations = ['Chandigarh', 'Mohali'];

export const JobseekerProfile = () => {
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [skills, setSkills] = useState(initialSkills);
  const [skillInput, setSkillInput] = useState('');

  const [locations, setLocations] = useState(initialLocations);
  const [locationInput, setLocationInput] = useState('');

  const [relocate, setRelocate] = useState('yes');

  const [resumeFile, setResumeFile] = useState({
    name: 'Rahul_Kumar_Resume.pdf',
    size: '1.2 MB · Updated 2 days ago'
  });

  const [saved, setSaved] = useState(false);


  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target.result);
    reader.readAsDataURL(file);
  };


  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB · Just now`
    });
  };


  const deleteResume = () => {
    if (window.confirm('Remove your resume?')) {
      setResumeFile(null);
    }
  };


  const addSkill = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;

    setSkills([...skills, value]);
    setSkillInput('');
  };


  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };


  const toggleLocationPill = (city) => {
    setLocations(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };


  const addLocationFromInput = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const value = locationInput.trim();
    if (!value || locations.includes(value)) return;

    setLocations([...locations, value]);
    setLocationInput('');
  };


  const removeLocation = (city) => {
    setLocations(locations.filter(c => c !== city));
  };


  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  return (
    <div className="space-y-6">

      {saved && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          Profile updated successfully!
        </div>
      )}


      {/* Profile Header */}
      <div className="flex flex-col items-center gap-5 rounded-md border border-slate-100 bg-white p-8 shadow-sm sm:flex-row sm:items-center">

        <div className="group relative h-24 w-24 shrink-0">

          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FF6B00] text-3xl font-bold text-white">
              RK
            </div>
          )}

          <label
            htmlFor="photoUpload"
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
          >
            <Camera className="h-6 w-6" />
          </label>

          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

        </div>

        <div className="text-center sm:text-left">

          <h3 className="text-xl font-bold text-[#0f172a]">
            Rahul Kumar
          </h3>

          <div className="mt-1 text-sm text-slate-500">
            <span className="font-bold text-slate-700">Frontend Developer</span> at <span className="font-bold text-slate-700">Freelance</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400 sm:justify-start">

            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Hamirpur, HP
            </span>

            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> rahul.kumar@email.com
            </span>

            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> +91 98765 43210
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Member since Jan 2026
            </span>

          </div>

        </div>

      </div>




      <div className="grid gap-7 lg:grid-cols-2">


        {/* Left Column */}
        <div className="space-y-5">


          {/* Personal Information */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">

            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <User className="h-5 w-5 text-[#0047C7]" /> Personal Information
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="Rahul Kumar"
                  readOnly
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  defaultValue="rahul.kumar@email.com"
                  readOnly
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Date of Birth
                </label>
                <input
                  type="date"
                  defaultValue="1998-06-15"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Current Location
                </label>
                <input
                  type="text"
                  defaultValue="Hamirpur, Himachal Pradesh, India"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Current Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="Frontend Developer (Freelance)"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              {/* Preferred Location */}
              <div className="sm:col-span-2">

                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Preferred Location <span className="text-rose-500">*</span>
                </label>

                <div className="rounded-md border border-slate-200 p-3">

                  <div className="flex flex-wrap gap-2">

                    {suggestedCities.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleLocationPill(city)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                          locations.includes(city)
                            ? 'border-[#0047C7] bg-[#0047C7] text-white'
                            : 'border-slate-200 text-slate-600 hover:border-[#0047C7] hover:text-[#0047C7]'
                        }`}
                      >
                        {city}
                      </button>
                    ))}

                  </div>


                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">

                    {locations.map(city => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7]"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => removeLocation(city)}
                          aria-label={`Remove ${city}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyDown={addLocationFromInput}
                      placeholder="Type to add more..."
                      className="min-w-[140px] flex-1 border-none px-1 py-1 text-xs text-slate-700 focus:outline-none"
                    />

                  </div>

                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Click on cities above or type to add. Selected locations appear below.
                </p>

              </div>

              {/* Want to Relocate */}
              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Want to Relocate? <span className="text-rose-500">*</span>
                </label>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() => setRelocate('yes')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition ${
                      relocate === 'yes'
                        ? 'border-[#0047C7] bg-blue-50 text-[#0047C7]'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> Yes, willing
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelocate('no')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition ${
                      relocate === 'no'
                        ? 'border-[#0047C7] bg-blue-50 text-[#0047C7]'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> No, prefer local
                  </button>

                </div>

              </div>

            </div>

          </div>




          {/* Work Experience */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">

            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Briefcase className="h-5 w-5 text-[#0047C7]" /> Work Experience
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Total Experience <span className="text-rose-500">*</span>
                </label>
                <select
                  defaultValue="1 - 2 Years"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                >
                  <option>Fresher</option>
                  <option>1 - 2 Years</option>
                  <option>3 - 5 Years</option>
                  <option>5 - 10 Years</option>
                  <option>10+ Years</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Work Status <span className="text-rose-500">*</span>
                </label>
                <select
                  defaultValue="Currently Unemployed"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                >
                  <option>Currently Employed</option>
                  <option>Currently Unemployed</option>
                  <option>Self Employed / Freelance</option>
                  <option>Student</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Previous Company (if any)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TCS, Infosys"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Brief Bio / Summary
                </label>
                <textarea
                  rows={4}
                  defaultValue="Passionate frontend developer with 2 years of experience building responsive web applications. Skilled in React, JavaScript, and modern CSS frameworks. Looking for challenging opportunities to grow and contribute."
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

            </div>

          </div>

        </div>




        {/* Right Column */}
        <div className="space-y-5">


          {/* Skills */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">

            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Sparkles className="h-5 w-5 text-[#0047C7]" /> Skills <span className="text-rose-500">*</span>
            </h5>

            <div
              onClick={() => document.getElementById('skillInput')?.focus()}
              className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-3"
            >

              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                id="skillInput"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type skill and press Enter..."
                className="min-w-[140px] flex-1 border-none px-1 py-1 text-xs text-slate-700 focus:outline-none"
              />

            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Press Enter to add a skill.
            </p>

          </div>




          {/* Education */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">

            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <GraduationCap className="h-5 w-5 text-[#0047C7]" /> Education
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Highest Qualification <span className="text-rose-500">*</span>
                </label>
                <select
                  defaultValue="Bachelor's Degree"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                >
                  <option>High School</option>
                  <option>Diploma</option>
                  <option>Bachelor's Degree</option>
                  <option>Master's Degree</option>
                  <option>PhD</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Year of Passing
                </label>
                <select
                  defaultValue="2022"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                >
                  <option>2020</option>
                  <option>2021</option>
                  <option>2022</option>
                  <option>2023</option>
                  <option>2024</option>
                  <option>2025</option>
                  <option>2026</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Field of Study
                </label>
                <input
                  type="text"
                  defaultValue="Computer Science & Engineering"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  College / University
                </label>
                <input
                  type="text"
                  defaultValue="Himachal Pradesh University"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

            </div>

          </div>




          {/* Resume */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">

            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <FileText className="h-5 w-5 text-[#0047C7]" /> Resume <span className="text-rose-500">*</span>
            </h5>

            <label
              htmlFor="resumeUpload"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-[#0047C7] hover:bg-blue-50/40"
            >
              <UploadCloud className="h-8 w-8 text-[#0047C7]" />
              <h6 className="text-sm font-bold text-[#0f172a]">
                Upload your resume
              </h6>
              <p className="text-xs text-slate-400">
                PDF, DOC, or DOCX format. Max 5 MB.
              </p>
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />
            </label>

            {resumeFile && (
              <div className="mt-4 flex items-center gap-3 rounded-md border border-slate-100 p-4">

                <FileText className="h-8 w-8 shrink-0 text-rose-500" />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-800">
                    {resumeFile.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {resumeFile.size}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={deleteResume}
                  title="Remove resume"
                  className="shrink-0 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>
            )}

          </div>




          {/* Social Links */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">

            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Link2 className="h-5 w-5 text-[#0047C7]" /> Social & Professional Links
            </h5>

            <div className="space-y-4">

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  defaultValue="https://linkedin.com/in/rahulkumar"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  defaultValue="https://github.com/rahulkumar"
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none focus:ring-2 focus:ring-[#0047C7]/20"
                />
              </div>

            </div>

          </div>




          {/* Save / Cancel */}
          <div className="flex gap-3">

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md bg-[#0047C7] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#00389c]"
            >
              <Check className="h-4 w-4" /> Save Changes
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" /> Cancel
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


export default JobseekerProfile;