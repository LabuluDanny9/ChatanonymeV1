/**
 * Fonctionnalités plateforme (forum, chat, etc.) — exposées par GET /api/config
 */

import { useState, useEffect } from 'react';
import api from '../lib/api';

export const DEFAULT_PLATFORM_FEATURES = {
  forum: true,
  privateChat: true,
  userToUserChat: false,
  broadcasts: true,
  registrations: true,
};

export function usePlatformFeatures() {
  const [features, setFeatures] = useState(DEFAULT_PLATFORM_FEATURES);

  useEffect(() => {
    api
      .get('/api/config')
      .then(({ data }) => {
        setFeatures({ ...DEFAULT_PLATFORM_FEATURES, ...(data.features || {}) });
      })
      .catch(() => {});
  }, []);

  return features;
}
