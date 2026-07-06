import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStoreSettings } from '../apis/store.api';

const StoreSettingsContext = createContext({
    settings: null,
    loading: true,
    refreshSettings: async () => {},
});

const StoreSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        try {
            const data = await getStoreSettings();
            setSettings(data);
            return data;
        } catch {
            setSettings(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    const value = useMemo(
        () => ({ settings, loading, refreshSettings }),
        [settings, loading, refreshSettings],
    );

    return (
        <StoreSettingsContext.Provider value={value}>
            {children}
        </StoreSettingsContext.Provider>
    );
};

const useStoreSettings = () => useContext(StoreSettingsContext);

export {
    StoreSettingsProvider,
    useStoreSettings,
};
