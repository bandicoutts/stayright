'use client'

/**
 * Centred icons wrapper to ensure compatibility with Next.js Server Components.
 * Phosphor icons use React Context which can cause "Failed to collect page data"
 * during build-time SSR if not handled via a client-boundary.
 */

export {
  Shield,
  ShieldCheck,
  Envelope,
  Check,
  Plus,
  Trash,
  SquaresFour,
  FileText,
  Gear,
  SignOut,
  List,
  X,
  Calendar,
  AirplaneTilt,
  Calculator,
  Bell,
  FileArrowDown,
  TwitterLogo,
  LinkedinLogo,
  Sun,
  Moon,
} from '@phosphor-icons/react'
