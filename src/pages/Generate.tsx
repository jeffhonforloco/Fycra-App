import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Generate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [style, setStyle] = useState<'modern' | 'dramatic' | 'minimal' | 'bold'>('modern');

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }
      setBackgroundImage(file);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Please sign in to generate thumbnails');
      }

      let backgroundUrl = '';
      if (backgroundImage) {
        const filename = `${user.data.user.id}/${Date.now()}-${backgroundImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('backgrounds')
          .upload(filename, backgroundImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('backgrounds')
          .getPublicUrl(filename);

        backgroundUrl = publicUrl;
      }

      const prompt = `Create a ${style} YouTube thumbnail for: ${title}${
        backgroundUrl ? ` incorporating the uploaded background image: ${backgroundUrl}` : ''
      }`;

      const { data, error: dbError } = await supabase
        .from('thumbnails')
        .insert({
          title,
          prompt,
          user_id: user.data.user.id,
          image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80', // Placeholder
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Thumbnail generated successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnail');
      toast.error('Failed to generate thumbnail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Generate Your Thumbnail</h1>
        <p className="text-gray-600">
          Enter your video title and let AI create the perfect thumbnail
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Video Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Enter your video title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['modern', 'dramatic', 'minimal', 'bold'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  style === s
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center space-y-4">
            {backgroundImage ? (
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(backgroundImage)}
                  alt="Background preview"
                  className="max-h-48 rounded"
                />
                <button
                  type="button"
                  onClick={() => setBackgroundImage(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Upload className="h-12 w-12" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Optional: Upload a background image or logo
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Select Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Thumbnail'
          )}
        </button>
      </form>
    </div>
  );
}