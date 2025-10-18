import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { categoryService } from "../services/categoryService";
import { Category, UpdateCategoryRequest } from "../types/category";
import Modal from "./Modal";

const CATEGORY_TYPES = [
  { value: "place", label: "Place" },
  { value: "article", label: "Article" },
  { value: "event", label: "Event" },
  { value: "accommodation", label: "Accommodation" },
  { value: "restaurant", label: "Restaurant" },
  { value: "tour", label: "Tour" },
];

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess?: () => void;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateCategoryRequest>({
    name: "",
    slug: "",
    type: "place",
    isActive: true,
  });

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        type: category.type,
        isActive: category.isActive,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!category) return;

    setLoading(true);
    try {
      await categoryService.updateCategory(category.id, formData);
      toast.success("Cập nhật category thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !category) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Chỉnh sửa Category">
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

        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Trạng thái
          </label>
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                isActive: !formData.isActive,
              })
            }
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
              formData.isActive
                ? "bg-gradient-to-r from-ocean-600 to-turquoise-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="ml-3 text-sm text-white/80">
            {formData.isActive ? "Active" : "Inactive"}
          </span>
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
            {loading ? "Đang cập nhật..." : "Cập nhật Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
