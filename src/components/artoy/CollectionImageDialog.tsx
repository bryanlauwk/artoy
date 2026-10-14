import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";

export type ImagePreview = { image: string; title: string };
export function CollectionImageDialog({
  preview,
  onClose,
}: {
  preview: ImagePreview | null;
  onClose: () => void;
}) {
  const extension = preview?.image.startsWith("data:image/jpeg")
    ? "jpg"
    : preview?.image.startsWith("data:image/webp")
      ? "webp"
      : "png";
  return (
    <Dialog
      open={!!preview}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="collection-image-dialog">
        {preview && (
          <>
            <DialogTitle>{preview.title}</DialogTitle>
            <DialogDescription>
              Explore the full image, then return to your collection.
            </DialogDescription>
            <img src={preview.image} alt={preview.title} />
            <a
              href={preview.image}
              download={`artoy-${preview.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`}
              className="collection-download"
            >
              <Download size={16} /> Save image
            </a>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
