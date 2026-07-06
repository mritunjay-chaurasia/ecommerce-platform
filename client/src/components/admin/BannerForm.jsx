import { Button, InputField, SelectField, ImageUpload } from '../ui';

const BannerForm = ({
    form,
    errors,
    placementOptions,
    onChange,
    onImageItemChange,
    onSubmit,
    onCancel,
    saving = false,
    isEditing = false,
}) => (
    <form onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
            <InputField
                label="Title"
                name="title"
                value={form.title}
                onChange={onChange}
                error={errors.title}
                placeholder="e.g. Up to 70% off on top brands"
                required
                inputProps={{ maxLength: 120 }}
            />
            <InputField
                label="Tag"
                name="tag"
                value={form.tag}
                onChange={onChange}
                error={errors.tag}
                placeholder="e.g. Big Shopping Days"
                inputProps={{ maxLength: 60 }}
            />
            <SelectField
                label="Placement"
                name="placement"
                value={form.placement}
                onChange={onChange}
                error={errors.placement}
                options={placementOptions}
                placeholder="Select placement"
                required
            />
            <InputField
                label="Sort Order"
                name="sortOrder"
                type="number"
                min="0"
                max="9999"
                step="1"
                value={form.sortOrder}
                onChange={onChange}
                error={errors.sortOrder}
                placeholder="Lower numbers appear first"
                inputProps={{ min: 0, max: 9999, step: 1 }}
            />
            <InputField
                label="Button Text"
                name="buttonText"
                value={form.buttonText}
                onChange={onChange}
                error={errors.buttonText}
                placeholder="e.g. Shop Now"
                inputProps={{ maxLength: 40 }}
            />
            <InputField
                label="Start Date"
                name="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={onChange}
                error={errors.startsAt}
            />
            <InputField
                label="Expiry Date"
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={onChange}
                error={errors.expiresAt}
            />
        </div>

        <div className="mt-4">
            <ImageUpload
                label="Banner Image"
                value={form.imageItem}
                onChange={onImageItemChange}
                error={errors.imageItem}
                disabled={saving}
            />
        </div>

        <div className="mt-4">
            <InputField
                label="Subtitle"
                name="subtitle"
                value={form.subtitle}
                onChange={onChange}
                error={errors.subtitle}
                placeholder="Short supporting text for the banner"
                multiline
                rows={3}
                inputProps={{ maxLength: 300 }}
            />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300"
            />
            Active banner
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
            </Button>
            <Button type="submit" loading={saving}>
                {isEditing ? 'Update Banner' : 'Create Banner'}
            </Button>
        </div>
    </form>
);

export default BannerForm;
