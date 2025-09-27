"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount, useSignMessage } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { UserProfile, CreateProfileRequest } from "~~/types/profile";
import {
  UserIcon,
  PencilIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  CameraIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

const Profile: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState<CreateProfileRequest>({
    displayName: "",
    bio: "",
    profilePicture: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      website: "",
      discord: ""
    },
    investmentPreferences: []
  });

  // Load profile data from API
  useEffect(() => {
    if (connectedAddress) {
      loadProfile();
    }
  }, [connectedAddress]);

  const loadProfile = async () => {
    if (!connectedAddress) return;

    setIsLoadingProfile(true);
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'X-Wallet-Address': connectedAddress
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProfile(data.data);
          setFormData({
            displayName: data.data.displayName,
            bio: data.data.bio || "",
            profilePicture: data.data.profilePicture || "",
            socialLinks: data.data.socialLinks || {
              twitter: "",
              linkedin: "",
              website: "",
              discord: ""
            },
            investmentPreferences: data.data.investmentPreferences || []
          });
        }
      } else if (response.status !== 404) {
        // Only show error if it's not a "not found" error (which is expected for new users)
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field: keyof CreateProfileRequest, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const verifyOwnership = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return false;
    }

    try {
      const message = `Verify ownership of wallet ${connectedAddress} for profile update at ${new Date().toISOString()}`;

      await signMessageAsync({
        message: message,
      });

      notification.success("Wallet ownership verified successfully!");
      return true;
    } catch (error) {
      console.error("Verification failed:", error);
      notification.error("Verification failed. Please try again.");
      return false;
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Verify wallet ownership before saving
      const isVerified = await verifyOwnership();

      if (!isVerified) {
        setIsLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.displayName.trim()) {
        notification.error("Display name is required");
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': connectedAddress!
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
        notification.success("Profile updated successfully!");
      } else {
        notification.error(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      notification.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio || "",
        profilePicture: profile.profilePicture || "",
        socialLinks: profile.socialLinks || {
          twitter: "",
          linkedin: "",
          website: "",
          discord: ""
        },
        investmentPreferences: profile.investmentPreferences || []
      });
    }
    setIsEditing(false);
  };

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-base-content mb-4">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-100 to-primary/5">
      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card bg-base-100/80 backdrop-blur-sm shadow-2xl border border-base-300/50 hover:shadow-3xl transition-all duration-300">
          <div className="card-body p-10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Profile Information
                </h2>
                <p className="text-base-content/60 mt-1">Manage your personal information and preferences</p>
              </div>

              {!isEditing ? (
                <button
                  className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon className="h-5 w-5" />
                  {profile ? 'Edit Profile' : 'Create Profile'}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    className="btn btn-ghost btn-lg hover:bg-base-200"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="h-5 w-5" />
                        Save & Verify
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-6">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 flex items-center justify-center border-4 border-white shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                    {profile?.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-20 w-20 text-base-content/40" />
                    )}
                  </div>

                  {isEditing && (
                    <button className="btn btn-sm btn-primary btn-circle absolute bottom-2 right-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                      <CameraIcon className="h-4 w-4" />
                    </button>
                  )}

                  {/* Online indicator */}
                  <div className="absolute top-2 right-2 w-4 h-4 bg-success rounded-full border-2 border-white shadow-sm"></div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-base-content">
                    {profile?.displayName || "Anonymous User"}
                  </h3>
                  {profile?.kycStatus === 'verified' && (
                    <div className="inline-flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full border border-success/20">
                      <CheckBadgeIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                  {profile?.investmentPreferences && profile.investmentPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {profile.investmentPreferences.slice(0, 2).map((pref) => (
                        <span key={pref} className="badge badge-outline badge-sm">
                          {pref}
                        </span>
                      ))}
                      {profile.investmentPreferences.length > 2 && (
                        <span className="badge badge-outline badge-sm">
                          +{profile.investmentPreferences.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-3 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content">Display Name *</span>
                      <span className="label-text-alt text-error">Required</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-lg focus:input-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        placeholder="Enter your display name"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange("displayName", e.target.value)}
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-base-200 to-base-300/50 py-4 px-5 rounded-xl border border-base-300/50">
                        <p className="text-base-content font-medium">
                          {profile?.displayName || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content">Profile Picture URL</span>
                      <span className="label-text-alt text-base-content/60">Optional</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        className="input input-bordered input-lg focus:input-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        placeholder="https://example.com/your-image.jpg"
                        value={formData.profilePicture}
                        onChange={(e) => handleInputChange("profilePicture", e.target.value)}
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-base-200 to-base-300/50 py-4 px-5 rounded-xl border border-base-300/50">
                        <p className="text-base-content font-medium break-all">
                          {profile?.profilePicture || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Bio</span>
                    <span className="label-text-alt text-base-content/60">Tell us about yourself</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      className="textarea textarea-bordered focus:border-primary focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md h-24 resize-none text-base leading-relaxed"
                      placeholder="Tell us about yourself and your investment interests..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-base-200 to-base-300/50 py-4 px-5 rounded-xl border border-base-300/50 h-24 flex items-start">
                      <p className="text-base-content font-medium">
                        {profile?.bio || "No bio provided"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="card-body p-6">
                    <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      Social Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(formData.socialLinks || {}).map(([platform, url]) => (
                        <div key={platform} className="form-control">
                          <label className="label py-1">
                            <span className="label-text font-medium capitalize flex items-center gap-2">
                              {platform === 'twitter' && '🐦'}
                              {platform === 'linkedin' && '💼'}
                              {platform === 'website' && '🌐'}
                              {platform === 'discord' && '💬'}
                              {platform}
                            </span>
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              className="input input-bordered focus:input-primary transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder={`Your ${platform} profile URL`}
                              value={url}
                              onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                            />
                          ) : (
                            <div className="bg-base-100 py-3 px-4 rounded-lg border border-base-300/50">
                              <p className="text-base-content text-sm break-all">
                                {url || "Not provided"}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Investment Preferences */}
                <div className="card bg-gradient-to-br from-secondary/5 to-accent/5 border border-secondary/20">
                  <div className="card-body p-6">
                    <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                      🏢 Investment Preferences
                    </h3>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["Residential", "Commercial", "Industrial", "Retail", "Office"].map((type) => (
                          <label key={type} className="cursor-pointer">
                            <div className={`card card-compact border-2 transition-all duration-300 hover:shadow-md ${
                              formData.investmentPreferences?.includes(type)
                                ? 'border-primary bg-primary/10 shadow-lg'
                                : 'border-base-300 hover:border-primary/50'
                            }`}>
                              <div className="card-body items-center text-center p-4">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-primary checkbox-sm mb-2"
                                  checked={formData.investmentPreferences?.includes(type) || false}
                                  onChange={(e) => {
                                    const current = formData.investmentPreferences || [];
                                    if (e.target.checked) {
                                      handleInputChange("investmentPreferences", [...current, type]);
                                    } else {
                                      handleInputChange("investmentPreferences", current.filter(p => p !== type));
                                    }
                                  }}
                                />
                                <span className="text-sm font-medium">{type}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile?.investmentPreferences?.length ? (
                          profile.investmentPreferences.map((pref) => (
                            <span key={pref} className="badge badge-primary badge-lg">
                              {pref}
                            </span>
                          ))
                        ) : (
                          <p className="text-base-content/60 italic">No preferences specified</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {profile?.updatedAt && (
                  <div className="flex items-center gap-2 text-sm text-base-content/60 bg-base-200/50 px-4 py-2 rounded-full w-fit">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Verification Info */}
            <div className="mt-10 alert alert-info shadow-lg border border-info/30">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="h-6 w-6 text-info flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-info mb-2 text-lg">🔐 Profile Verification</h4>
                  <p className="text-sm text-base-content/80 leading-relaxed">
                    When you save your profile, you'll be asked to sign a message with your wallet to verify ownership.
                    This ensures that only you can update your profile information and maintains the security of your data.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge badge-info badge-sm">🛡️ Secure</span>
                    <span className="badge badge-info badge-sm">⚡ Fast</span>
                    <span className="badge badge-info badge-sm">🔒 Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;