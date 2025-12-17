import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, fetchJson, getErrorMessage } from '@/utils/api';
import { useAuth } from './useAuth';

export interface UserProfileForm {
  firstName: string;
  lastName: string;
  ssn: string;
  phone: string;
}

interface UserProfileResponse {
  firstName?: string | null;
  lastName?: string | null;
  ssn?: string | null;
  phone?: string | null;
}

export function useUserProfile() {
  const { isAuthenticated, refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfileForm>({
    firstName: '',
    lastName: '',
    ssn: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const data = await fetchJson<UserProfileResponse>('/user/me');
      setProfile({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        ssn: data.ssn ?? '',
        phone: data.phone ?? '',
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Klarte ikke å hente brukerdata.'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(
    async (values: UserProfileForm) => {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        ssn: values.ssn.trim(),
        phone: values.phone.trim(),
      };

      if (!payload.firstName || !payload.lastName || !payload.ssn || !payload.phone) {
        throw new ApiError('Fyll inn alle feltene før du lagrer.', 400);
      }

      setIsSaving(true);
      setError(null);
      try {
        await fetchJson('/user/me', {
          method: 'PUT',
          body: payload,
        });
        setProfile(payload);
        await refreshUser();
      } catch (err) {
        setError(getErrorMessage(err, 'Kunne ikke lagre informasjon.'));
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshUser]
  );

  const needsInfo = useMemo(
    () =>
      !profile.firstName.trim() ||
      !profile.lastName.trim() ||
      !profile.ssn.trim() ||
      !profile.phone.trim(),
    [profile.firstName, profile.lastName, profile.ssn, profile.phone]
  );

  return {
    profile,
    isLoading,
    isSaving,
    error,
    needsInfo,
    saveProfile,
    refresh: loadProfile,
  };
}
