"use client"

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  website: "",
  description: "",
  royalty: "",
  royaltyWallet: "",
  blockchain: "Plume",
  twitter: "",
  telegram: "",
  discord: "",
  medium: "",
  facebook: "",
};

export default function CreateCollectionPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useWallet();
  const router = useRouter();

  const handleImageChange = (type: "logo" | "banner", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (type === "logo") {
          setLogoPreview(ev.target?.result as string);
          setLogoFile(file);
        } else {
          setBannerPreview(ev.target?.result as string);
          setBannerFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!isConnected) {
      setError("You must connect your wallet to create a collection.");
      return;
    }
    if (!logoFile || !bannerFile || !form.name.trim()) {
      setError("Logo, banner, and collection name are required.");
      return;
    }
    setLoading(true);
    try {
      // Upload logo
      const logoData = new FormData();
      logoData.append("file", logoFile);
      const logoRes = await fetch("/api/upload", { method: "POST", body: logoData });
      const logoJson = await logoRes.json();
      if (!logoRes.ok) throw new Error(logoJson.error || "Logo upload failed");
      // Upload banner
      const bannerData = new FormData();
      bannerData.append("file", bannerFile);
      const bannerRes = await fetch("/api/upload", { method: "POST", body: bannerData });
      const bannerJson = await bannerRes.json();
      if (!bannerRes.ok) throw new Error(bannerJson.error || "Banner upload failed");
      // Submit collection
      const payload = {
        name: form.name,
        website: form.website,
        description: form.description,
        royalty: form.royalty,
        royaltyWallet: form.royaltyWallet,
        blockchain: form.blockchain,
        twitter: form.twitter,
        telegram: form.telegram,
        discord: form.discord,
        medium: form.medium,
        facebook: form.facebook,
        logoUrl: logoJson.url,
        bannerUrl: bannerJson.url,
        walletAddress: address,
      };
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create collection");
      setSuccess("Collection created successfully!");
      setForm(initialForm);
      setLogoPreview(null);
      setBannerPreview(null);
      setLogoFile(null);
      setBannerFile(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      if (bannerInputRef.current) bannerInputRef.current.value = "";
      // Redirect to profile collections tab
      setTimeout(() => {
        router.push("/profile?tab=collections");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      {/* Left: Info */}
      <div className="flex-1 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-white">Apply for Collection Verification</h1>
        <div className="text-gray-300 mb-6">
          LID collection as LID-Bloc Partners enjoys benefits like:<br />
          <span className="ml-2">• Verified Mark</span><br />
          <span className="ml-2">• Attribute Filter</span><br />
        </div>
        <div className="text-gray-400 mb-6">
          For LIDs with non-standard metadata, we also provide manual support for converting them into displayable format.<br />
          <br />
          Fill in the form and we will contact you later.
        </div>
      </div>
      {/* Right: Form */}
      {isConnected ? (
        <form className="flex-[2] bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-12 space-y-12 w-full mx-auto shadow-xl backdrop-blur-md" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            {/* Logo image */}
            <div className="flex flex-col items-center flex-shrink-0 w-full md:w-auto" style={{maxWidth: 350}}>
              <label className="block text-white font-semibold mb-2">Logo image<span className="text-red-500">*</span></label>
              <div className="text-gray-400 text-xs mb-2">This image will also be used for navigation.<br />JPG or PNG, 350x350px</div>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-center aspect-square w-full">
                {logoPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg bg-gray-800" />
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow focus:outline-none z-10"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                        if (logoInputRef.current) logoInputRef.current.value = "";
                      }}
                      aria-label="Remove logo image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-500 mb-2">Drag and drop an image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      ref={logoInputRef}
                      onChange={(e) => handleImageChange("logo", e)}
                    />
                    <button
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded mt-4"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Banner image */}
            <div className="flex flex-col items-center flex-1">
              <label className="block text-white font-semibold mb-2">Banner image<span className="text-red-500">*</span></label>
              <div className="text-gray-400 text-xs mb-2">This image will also be used for navigation.<br />JPG or PNG, 1860x465px</div>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-center aspect-[4/1] w-full h-full max-w-4xl mx-auto">
                {bannerPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-contain rounded-lg bg-gray-800" />
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow focus:outline-none z-10"
                      onClick={() => {
                        setBannerPreview(null);
                        setBannerFile(null);
                        if (bannerInputRef.current) bannerInputRef.current.value = "";
                      }}
                      aria-label="Remove banner image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-500 mb-2">Drag and drop an image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      ref={bannerInputRef}
                      onChange={(e) => handleImageChange("banner", e)}
                    />
                    <button
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded mt-4"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-1">Collection's name<span className="text-red-500">*</span></label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" required value={form.name} onChange={e => handleInputChange("name", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Website</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.website} onChange={e => handleInputChange("website", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-1">Description</label>
              <textarea className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white min-h-[80px]" value={form.description} onChange={e => handleInputChange("description", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Type your desired Royalty fee rate below (Max 3%)</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.royalty} onChange={e => handleInputChange("royalty", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Wallet address to receive the Royalty fee</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.royaltyWallet} onChange={e => handleInputChange("royaltyWallet", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Which Blockchain is Your Project on?</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.blockchain} onChange={e => handleInputChange("blockchain", e.target.value)}>
                <option>Plume</option>
                <option>Ethereum</option>
                <option>Polygon</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Twitter link</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.twitter} onChange={e => handleInputChange("twitter", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Telegram group link</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.telegram} onChange={e => handleInputChange("telegram", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Discord server link</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.discord} onChange={e => handleInputChange("discord", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Medium link</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.medium} onChange={e => handleInputChange("medium", e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Facebook link</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white" value={form.facebook} onChange={e => handleInputChange("facebook", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-2 rounded" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-[2] bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-12 w-full mx-auto shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-gray-300 text-lg mb-4">Please connect your wallet to create a collection.</div>
        </div>
      )}
    </div>
  );
}
