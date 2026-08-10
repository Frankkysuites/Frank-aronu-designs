// Import toast directly from toaster so there's no undefined reference
import { toast } from '@/components/ui/toaster'

export { toast }

export function useToast() {
  return { toast }
}
