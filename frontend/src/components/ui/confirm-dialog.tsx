import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 rounded-full p-2 ${
              variant === 'destructive' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

