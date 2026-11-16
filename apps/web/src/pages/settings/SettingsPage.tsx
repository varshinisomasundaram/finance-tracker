import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Trash2, LogOut, Shield, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { usersService } from '@/services/users.service'
import { useToast } from '@/hooks/useToast'
import { Badge } from '@/components/ui/badge'

// ── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  currency: z.string().length(3, 'Must be a 3-letter currency code'),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PasswordValues = z.infer<typeof passwordSchema>

// ── Common currencies ─────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: 'INR', label: '₹ INR — Indian Rupee' },
  { value: 'USD', label: '$ USD — US Dollar' },
  { value: 'EUR', label: '€ EUR — Euro' },
  { value: 'GBP', label: '£ GBP — British Pound' },
  { value: 'SGD', label: 'S$ SGD — Singapore Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'JPY', label: '¥ JPY — Japanese Yen' },
  { value: 'CAD', label: 'CA$ CAD — Canadian Dollar' },
  { value: 'AUD', label: 'A$ AUD — Australian Dollar' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useAuthStore((s) => s.logout)
  const { toast } = useToast()

  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // ── Profile form ─────────────────────────────────────────────────────────

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      currency: user?.currency ?? 'INR',
    },
  })

  async function onSaveProfile(values: ProfileValues) {
    setProfileSaving(true)
    try {
      const updated = await usersService.updateMe(values)
      updateUser(updated)
      toast({ title: 'Profile updated successfully' })
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Password form ─────────────────────────────────────────────────────────

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  })

  async function onChangePassword(values: PasswordValues) {
    setPasswordSaving(true)
    try {
      await usersService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset()
      toast({ title: 'Password changed successfully' })
    } catch {
      toast({ title: 'Failed to change password — check your current password', variant: 'destructive' })
    } finally {
      setPasswordSaving(false)
    }
  }

  // ── Delete account ────────────────────────────────────────────────────────

  async function handleDeleteAccount() {
    try {
      await usersService.deleteAccount()
      logout()
    } catch {
      toast({ title: 'Failed to delete account', variant: 'destructive' })
    }
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, preferences, and security</p>
      </div>

      {/* ── Account Info ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Account Information</CardTitle>
              <CardDescription>Your account details and membership</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">{memberSince}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account ID</p>
              <p className="font-mono text-xs text-muted-foreground">{user?.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Profile ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Update your display name and default currency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input {...profileForm.register('name')} placeholder="Your name" />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Default Currency</Label>
              <Select
                defaultValue={user?.currency ?? 'INR'}
                onValueChange={(v) => profileForm.setValue('currency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used to display all monetary values across the app</p>
            </div>
            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? 'Saving…' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center">
              <Lock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Use a strong password — min 8 chars, one uppercase, one number</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1">
              <Label>Current Password</Label>
              <Input type="password" {...passwordForm.register('currentPassword')} placeholder="••••••••" />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" {...passwordForm.register('newPassword')} placeholder="••••••••" />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Confirm New Password</Label>
                <Input type="password" {...passwordForm.register('confirmPassword')} placeholder="••••••••" />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Security Info ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription>Session and authentication details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Active Session</p>
                <p className="text-xs text-muted-foreground">You are currently logged in on this device</p>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">JWT with 15-minute access token + 7-day refresh token</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => { logout() }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* ── Notifications placeholder ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Renewal reminders and spending alerts — coming soon</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Future releases will include email reminders for insurance renewals, goal deadlines, and budget overruns.
          </p>
        </CardContent>
      </Card>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <Card className="border-destructive/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions — proceed with caution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="font-medium text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently deletes your account, all data, transactions, and settings. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="ml-4 shrink-0"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated data including transactions,
              assets, liabilities, goals, and budgets. <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
            </p>
            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
