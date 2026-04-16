
import { Seal, User, SealStatus, AppSettings } from '../types';
import { supabase } from './supabase';

/**
 * SERVICIO MAESTRO DE DATOS (SUPABASE)
 * Centraliza la comunicación con la base de datos en la nube.
 */

// Centralizamos los nombres de las tablas
const TABLES = {
  SEALS: 'seals_colcafe',
  USERS: 'users_colcafe',
  CITIES: 'cities_colcafe',
  SETTINGS: 'settings_colcafe',
};

export const ApiService = {
  // --- SELLOS / PRECINTOS ---
  async getSeals(): Promise<Seal[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SEALS)
        .select('*')
        .order('lastMovement', { ascending: false });

      if (error) throw error;
      return data as Seal[];
    } catch (error) {
      console.error('Supabase Fetch Error (Seals):', error);
      return JSON.parse(localStorage.getItem('selloData') || '[]');
    }
  },

  async saveSeals(seals: Seal[]): Promise<boolean> {
    try {
      // En Supabase podemos usar upsert para guardar todo el lote
      const { error } = await supabase
        .from(TABLES.SEALS)
        .upsert(seals, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase Save Error (Seals):', error);
      localStorage.setItem('selloData', JSON.stringify(seals));
      return false;
    }
  },

  async updateSeal(seal: Seal): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.SEALS)
        .update(seal)
        .eq('id', seal.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase Update Error (Seal):', error);
      return false;
    }
  },

  async deleteSeal(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.SEALS)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase Delete Error (Seal):', error);
      return false;
    }
  },

  // --- USUARIOS ---
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*');

      if (error) throw error;
      return data as User[];
    } catch (error) {
      console.error('Supabase Fetch Error (Users):', error);
      return JSON.parse(localStorage.getItem('selloUsers') || '[]');
    }
  },

  async saveUsers(users: User[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .upsert(users, { onConflict: 'id' });
      return !error;
    } catch {
      localStorage.setItem('selloUsers', JSON.stringify(users));
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- CIUDADES ---
  async getCities(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CITIES)
        .select('name');
      
      if (error) throw error;
      return data.map(c => c.name);
    } catch {
      return JSON.parse(localStorage.getItem('selloCities') || '["BOGOTÁ", "MEDELLÍN", "CALI", "BARRANQUILLA"]');
    }
  },

  async saveCities(cities: string[]): Promise<boolean> {
    try {
      const cityObjects = cities.map(name => ({ name }));
      const { error } = await supabase
        .from(TABLES.CITIES)
        .upsert(cityObjects, { onConflict: 'name' });
      return !error;
    } catch {
      localStorage.setItem('selloCities', JSON.stringify(cities));
      return false;
    }
  },

  async deleteCity(name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.CITIES)
        .delete()
        .eq('name', name);
      return !error;
    } catch {
      return false;
    }
  },

  // --- CONFIGURACIÓN ---
  async getSettings(): Promise<AppSettings> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SETTINGS)
        .select('*')
        .single();

      if (error) throw error;
      return data as AppSettings;
    } catch {
      return JSON.parse(localStorage.getItem('selloSettings') || '{"title": "GESTIÓN DE SELLOS COLCAFÉ", "logo": null, "sealTypes": ["Botella", "Cable", "Plástico"], "themeColor": "#C21B1B"}');
    }
  },

  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.SETTINGS)
        .upsert({ id: 1, ...settings }, { onConflict: 'id' });
      return !error;
    } catch {
      localStorage.setItem('selloSettings', JSON.stringify(settings));
      return false;
    }
  }
};
