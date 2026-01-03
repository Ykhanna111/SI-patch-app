import {
  type User,
  type InsertUser,
  type Game,
  type InsertGame,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";
import { supabase } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  getGame(id: string): Promise<Game | undefined>;
  getUserGames(userId: string): Promise<Game[]>;
  getActiveGame(userId: string): Promise<Game | undefined>;
  
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | undefined>;
}

export class SupabaseStorage implements IStorage {
  private mapUserData(data: any): User {
    return {
      id: data.id,
      username: data.username,
      email: data.email || null,
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      bio: data.bio || null,
      preferences: data.preferences || {},
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('id', id).single();
    return data ? this.mapUserData(data) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('username', username).single();
    return data ? this.mapUserData(data) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('email', email).single();
    return data ? this.mapUserData(data) : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const dbData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      bio: userData.bio,
      preferences: userData.preferences || {},
    };

    const { data, error } = await supabase.from('users').insert(dbData).select().single();
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return this.mapUserData(data);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const dbUpdates: any = {};
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
    return this.mapUserData(data);
  }

  async createGame(game: InsertGame): Promise<Game> {
    const { data, error } = await supabase.from('games').insert(game).select().single();
    if (error) {
      console.error('Error creating game:', error);
      throw error;
    }
    return data;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating game:', error);
      return undefined;
    }
    return data;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const { data } = await supabase.from('games').select().eq('id', id).single();
    return data || undefined;
  }

  async getUserGames(userId: string): Promise<Game[]> {
    const { data } = await supabase
      .from('games')
      .select()
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    return data || [];
  }

  async getActiveGame(userId: string): Promise<Game | undefined> {
    const { data } = await supabase
      .from('games')
      .select()
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    return data || undefined;
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const { data } = await supabase.from('user_stats').select().eq('user_id', userId).single();
    return data || undefined;
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const { data, error } = await supabase.from('user_stats').insert(stats).select().single();
    if (error) {
      console.error('Error creating user stats:', error);
      throw error;
    }
    return data;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | undefined> {
    const { data, error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) {
      console.error('Error updating user stats:', error);
      return undefined;
    }
    return data;
  }
}

export const storage = new SupabaseStorage();
