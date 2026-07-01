'use client'

/**
 * Centred icons wrapper to ensure compatibility with Next.js Server Components.
 * Phosphor icons use React Context which can cause "Failed to collect page data"
 * during build-time SSR if not handled via a client-boundary.
 */

export {
  House,
  Shield,
  ShieldCheck,
  CreditCard,
  Palette,
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
  CaretUp,
} from '@phosphor-icons/react'
