import { useCallback, useEffect, useState } from "react";
import {
    Client,
    CreateClientData,
    UpdateClientData,
    createClient,
    deleteClient,
    getClients,
    getUserTenants,
    updateClient,
    UserTenant,
} from "../api";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentTenant, setCurrentTenant] = useState<UserTenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const tenants = await getUserTenants(token);
      const ownerTenant = tenants.find((t) => t.is_owner) || tenants[0];
      setCurrentTenant(ownerTenant || null);

      const data = await getClients(token);
      setClients(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (data: CreateClientData) => {
    const token = getToken();
    if (!token || !currentTenant) return;

    setLoading(true);
    try {
      const newClient = await createClient(token, { ...data, tenant: currentTenant.tenant });
      setClients(prev => [...prev, newClient]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client.");
    } finally {
      setLoading(false);
    }
  };

  const editClient = async (id: number, data: UpdateClientData) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const updatedClient = await updateClient(token, id, data);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client.");
    } finally {
      setLoading(false);
    }
  };

  const removeClient = async (id: number) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      await deleteClient(token, id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client.");
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    currentTenant,
    loading,
    error,
    addClient,
    editClient,
    removeClient,
    refetch: fetchClients,
    setError,
  };
}
