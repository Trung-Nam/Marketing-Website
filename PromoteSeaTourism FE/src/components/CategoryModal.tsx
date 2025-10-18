import { useState } from "react";
import { toast } from "react-toastify";
import { categoryService } from "../services/categoryService";
import { CreateCategoryRequest } from "../types/category";
import Modal from "./Modal";

const CATEGORY_TYPES = [
  { value: "place", label: "Place" },
  { value: "article", label: "Article" },
  { value: "event", label: "Event" },
  { value: "accommodation", label: "Accommodation" },
  { value: "restaurant", label: "Restaurant" },
  { value: "tour", label: "Tour" },
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    slug: "",
    type: "place", // Default to "place"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      await categoryService.createCategory(formData);
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        name: "",
        slug: "",
        type: "place", // Default to "place"
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Tạo category thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form when closing
      setFormData({
        name: "",
        slug: "",
        type: "place", // Default to "place"
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo Category Mới">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Tên Category *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
            placeholder="Nhập tên category"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
            placeholder="du-lich-bien"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value,
              })
            }
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {CATEGORY_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
                className="bg-gray-800 text-white"
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 focus:outline-none focus:ring-2 focus:ring-ocean-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Đang tạo..." : "Tạo Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
