import {
  Recycle,
  FileText,
  Shield,
  Leaf,
  Smartphone,
  Trash2,
} from 'lucide-react';

export function getIconComponent(iconName) {
  const iconMap = {
    'recycle': Recycle,
    'file-text': FileText,
    'shield': Shield,
    'leaf': Leaf,
    'smartphone': Smartphone,
    'trash-2': Trash2,
  };

  return iconMap[iconName] || Trash2;
}


