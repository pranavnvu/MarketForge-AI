// ============================================
// DevForge AI — Settings & Profile Management
// ============================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  CheckCircle2,
  Camera,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  MapPin,
  Briefcase,
  GitBranch,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateProfile, useChangePassword, useDeleteAccount } from '@/hooks/use-auth';
import { useUIStore } from '@/stores/ui-store';
import { cleanImageUrl, isDirectImage } from '@/lib/avatar-helper';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

const avatarPresets = [
  { id: 'avatar-1', emoji: '⚡', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'avatar-2', emoji: '👨‍💻', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'avatar-3', emoji: '🚀', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'avatar-4', emoji: '🧠', bg: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'avatar-5', emoji: '🛡️', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'avatar-6', emoji: '🤖', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

export default function Settings() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const { theme, setTheme } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('profile');

  // Form State initialized with real User values
  const [name, setName] = useState(user?.name || 'Pranav Aggarwal');
  const [email, setEmail] = useState(user?.email || 'pranavaggarwal.in@gmail.com');
  const [avatarVal, setAvatarVal] = useState(user?.avatar || '⚡');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [pictureUrlInput, setPictureUrlInput] = useState('');

  const [jobTitle, setJobTitle] = useState(user?.jobTitle || 'Lead AI Engineering Architect');
  const [bio, setBio] = useState(
    user?.bio || 'Building autonomous AI multi-agent software systems with DevForge AI.'
  );
  const [location, setLocation] = useState(user?.location || 'New Delhi, India');
  const [website, setWebsite] = useState(user?.website || 'https://pranavaggarwal.in');
  const [github, setGithub] = useState(user?.github || 'pranavaggarwal');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI Toast State
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sync form inputs if user object loads asynchronously
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.avatar) setAvatarVal(user.avatar);
      if (user.jobTitle) setJobTitle(user.jobTitle);
      if (user.bio) setBio(user.bio);
      if (user.location) setLocation(user.location);
      if (user.website) setWebsite(user.website);
      if (user.github) setGithub(user.github);
    }
  }, [user]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const [imgError, setImgError] = useState(false);

  const updateAvatar = (newAvatar: string) => {
    const cleaned = cleanImageUrl(newAvatar);
    setImgError(false);
    setAvatarVal(cleaned);
    useAuthStore.getState().updateUser({ avatar: cleaned });
    updateProfile.mutate({ avatar: cleaned });
  };

  // Handle Local File Upload (converts image file to Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, GIF)', true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateAvatar(dataUrl);
        showToast('Profile picture uploaded and updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle External Picture URL (unwraps Google redirect URLs)
  const handleApplyPictureUrl = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const rawInput = pictureUrlInput.trim();
    if (!rawInput) return;

    const cleanedUrl = cleanImageUrl(rawInput);
    updateAvatar(cleanedUrl);
    setShowUrlInput(false);
    setPictureUrlInput('');
    showToast('Profile picture URL updated successfully!');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name,
        email,
        avatar: avatarVal,
        jobTitle,
        bio,
        location,
        website,
        github,
      });
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update profile', true);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter your current and new password.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', true);
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to change password.';
      showToast(typeof msg === 'string' ? msg : 'Failed to change password.', true);
    }
  };

  const handleDeleteAccountConfirm = () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm account deletion.', true);
      return;
    }
    deleteAccount.mutate();
  };

  const isImageAvatar = isDirectImage(avatarVal);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Toast Alerts */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-500 border border-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5" />
            {successToast}
          </motion.div>
        )}
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-red-500 border border-red-400 px-4 py-3 text-sm font-semibold text-white shadow-2xl"
          >
            <AlertTriangle className="h-5 w-5" />
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal profile, credentials, notifications, and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navigation Sidebar Tabs */}
        <nav className="flex lg:flex-col gap-1 lg:w-56 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab Content Box */}
        <div className="flex-1 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm shadow-sm space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-border/50 pb-6">
                {/* Avatar Badge with Clickable Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                  title="Click to upload profile picture"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-3xl font-extrabold text-white shadow-lg shadow-purple-500/20 ring-4 ring-primary/20 overflow-hidden">
                    {isImageAvatar && !imgError ? (
                      <img
                        src={cleanImageUrl(avatarVal)}
                        alt={name}
                        onError={() => {
                          setImgError(true);
                          showToast("Unable to load image file from URL. Make sure to right click the image directly & select 'Copy Image Address'.", true);
                        }}
                        className="h-full w-full object-cover"
                      />
                    ) : avatarVal ? (
                      <span>{avatarVal}</span>
                    ) : (
                      <span>{name && name.length > 0 ? name.charAt(0).toUpperCase() : 'P'}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-primary text-white p-1.5 shadow-lg border border-background group-hover:scale-110 transition-transform">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold truncate">{name || 'User Profile'}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
                      <Sparkles className="h-3 w-3" />
                      Pro Account
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>

                  {/* Profile Picture Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Picture
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 px-3 py-1.5 text-xs font-semibold hover:bg-accent transition-colors"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Image URL
                    </button>

                    {isImageAvatar && (
                      <button
                        type="button"
                        onClick={() => {
                          updateAvatar('⚡');
                          showToast('Photo removed, default set.');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove Photo
                      </button>
                    )}
                  </div>

                  {/* URL Input Dropdown */}
                  {showUrlInput && (
                    <div className="flex gap-2 max-w-md pt-2">
                      <input
                        type="text"
                        value={pictureUrlInput}
                        onChange={(e) => setPictureUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPictureUrl(e);
                          }
                        }}
                        placeholder="Paste image URL (e.g. github.com/username.png)"
                        className="flex-1 rounded-xl border border-border/50 bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPictureUrl}
                        className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Apply URL
                      </button>
                    </div>
                  )}

                  {/* Preset Avatar Selection */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-xs text-muted-foreground mr-1">Presets:</span>
                    {avatarPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => updateAvatar(preset.emoji)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm transition-all ${
                          avatarVal === preset.emoji
                            ? 'border-primary bg-primary/20 scale-110'
                            : 'border-border/50 hover:bg-accent'
                        }`}
                      >
                        {preset.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-primary" />
                      Avatar Image URL / Preset
                    </span>
                    {isImageAvatar && (
                      <span className="text-[11px] font-normal text-emerald-400">Custom Image Active</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={avatarVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAvatarVal(val);
                      useAuthStore.getState().updateUser({ avatar: val });
                    }}
                    placeholder="https://github.com/username.png or emoji (e.g. ⚡)"
                    className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      Job Title / Role
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Lead AI Engineer"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bio & Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your engineering interests..."
                    className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all leading-relaxed"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <LinkIcon className="h-3.5 w-3.5 text-primary" />
                      Portfolio / Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <GitBranch className="h-3.5 w-3.5 text-primary" />
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="username"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                <h3 className="font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Permanently delete your account and remove all active projects, API keys, and workspace data.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Account
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Security & Password</h2>
                <p className="text-xs text-muted-foreground">
                  Update your password and configure account security options.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  {changePassword.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Notification Preferences</h2>
                <p className="text-xs text-muted-foreground">Control how and when DevForge AI contacts you.</p>
              </div>

              <div className="space-y-4 max-w-lg">
                {[
                  { id: 'builds', title: 'Project Execution Complete', desc: 'Email notification when multi-agent build finishes.' },
                  { id: 'security', title: 'Security & Secret Alerts', desc: 'Alerts when OWASP vulnerability scanner finds secrets.' },
                  { id: 'newsletter', title: 'Product & Agent Updates', desc: 'Monthly updates on new AI agents and platform features.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/40 p-4 bg-background/40">
                    <div>
                      <p className="font-semibold text-xs">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Theme & Appearance</h2>
                <p className="text-xs text-muted-foreground">Customize the visual theme of the dashboard.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-xl border px-5 py-3 text-xs font-semibold capitalize transition-all ${
                      theme === t
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border/50 bg-background/40 hover:bg-accent'
                    }`}
                  >
                    {t === 'dark' ? '🌙 Dark Mode' : t === 'light' ? '☀️ Light Mode' : '🖥️ System Preference'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Integrations & Connected Services</h2>
                <p className="text-xs text-muted-foreground">Connect external services to your DevForge workspace.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: 'GitHub', desc: 'Push code directly to repositories.', connected: true },
                  { name: 'Vercel', desc: 'Deploy web applications seamlessly.', connected: false },
                  { name: 'Docker Hub', desc: 'Push containerized microservices.', connected: false },
                  { name: 'AWS Cloud', desc: 'Deploy cloud infrastructure.', connected: false },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-border/40 p-4 bg-background/40">
                    <div>
                      <p className="font-semibold text-xs">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-accent text-muted-foreground'}`}>
                      {item.connected ? 'Connected' : 'Connect'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-red-500/40 bg-card p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Confirmation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. All your project code, history, and workspace files will be permanently deleted.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Type <span className="font-bold text-foreground">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-xl border border-red-500/30 bg-background px-3.5 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="rounded-xl border border-border/50 px-4 py-2 text-xs font-semibold hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                Permanently Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
