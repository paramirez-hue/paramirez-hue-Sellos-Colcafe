
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
        .eq('id', 1)
        .single();

      if (error) {
        console.warn("No se pudo cargar config de Supabase, usando LocalStorage:", error.message);
        throw error;
      }
      return data as AppSettings;
    } catch {
      const fallback = '{"title": "GESTIÓN DE SELLOS COLCAFÉ", "logo": null, "sealTypes": ["Botella", "Cable", "Plástico", "Metálico"], "themeColor": "#C21B1B"}';
      return JSON.parse(localStorage.getItem('selloSettings') || fallback);
    }
  },

  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      // Guardamos en LocalStorage siempre como respaldo inmediato
      localStorage.setItem('selloSettings', JSON.stringify(settings));

      // Verificamos si las credenciales están presentes
      const { isSupabaseConfigured } = await import('./supabase');
      if (!isSupabaseConfigured) {
         console.warn("Supabase no está configurado. Verifique las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel.");
         return false;
      }

      console.log("Intentando guardar configuración en Supabase...", { title: settings.title, logoSize: settings.logo?.length });

      const { error } = await supabase
        .from(TABLES.SETTINGS)
        .upsert({ 
          id: 1, 
          title: settings.title, 
          logo: settings.logo, 
          sealTypes: settings.sealTypes, 
          themeColor: settings.themeColor 
        }, { onConflict: 'id' });
      
      if (error) {
        console.error("Error de Supabase (UPSERT):", error.message, error.details, error.hint);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Excepción al guardar configuración:", err);
      return false;
    }
  }
};
