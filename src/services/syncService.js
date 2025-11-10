import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { isOnline } from './network';

const SYNC_QUEUE_KEY = 'vehicle_sync_queue';
const VEHICLES_KEY = 'local_vehicles';

/**
 * Get sync queue from AsyncStorage
 */
const getSyncQueue = async () => {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

/**
 * Save sync queue to AsyncStorage
 */
const saveSyncQueue = async (queue) => {
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
    throw error;
  }
};

/**
 * Get local vehicles from AsyncStorage
 */
const getLocalVehicles = async () => {
  try {
    const vehiclesJson = await AsyncStorage.getItem(VEHICLES_KEY);
    return vehiclesJson ? JSON.parse(vehiclesJson) : [];
  } catch (error) {
    console.error('Error getting local vehicles:', error);
    return [];
  }
};

/**
 * Save local vehicles to AsyncStorage
 */
const saveLocalVehicles = async (vehicles) => {
  try {
    await AsyncStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error('Error saving local vehicles:', error);
    throw error;
  }
};

/**
 * Add a vehicle creation to the sync queue
 */
export const queueVehicleCreation = async (vehicleData) => {
  try {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // Save vehicle locally
    const localVehicles = await getLocalVehicles();
    const localVehicle = {
      id: localId,
      ...vehicleData,
      synced: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    localVehicles.push(localVehicle);
    await saveLocalVehicles(localVehicles);

    // Add to sync queue
    const queue = await getSyncQueue();
    const queueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'create',
      tableName: 'vehicles',
      recordId: localId,
      payload: vehicleData,
      retryCount: 0,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    queue.push(queueItem);
    await saveSyncQueue(queue);

    return { success: true, localId };
  } catch (error) {
    console.error('Error queueing vehicle creation:', error);
    throw error;
  }
};

/**
 * Sync pending queue items to Supabase
 */
export const syncQueue = async () => {
  if (!isOnline()) {
    console.log('Device is offline, skipping sync');
    return { synced: 0, failed: 0 };
  }

  try {
    const queue = await getSyncQueue();
    const pendingItems = queue.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;
    const updatedQueue = [...queue];
    const localVehicles = await getLocalVehicles();

    for (const item of pendingItems) {
      const itemIndex = updatedQueue.findIndex(q => q.id === item.id);
      if (itemIndex === -1) continue;

      try {
        // Insert to Supabase
        const { data, error } = await supabase
          .from('vehicles')
          .insert(item.payload)
          .select()
          .single();

        if (error) throw error;

        // Update local vehicle record
        const vehicleIndex = localVehicles.findIndex(v => v.id === item.recordId);
        if (vehicleIndex !== -1) {
          localVehicles[vehicleIndex].synced = true;
          localVehicles[vehicleIndex].updatedAt = Date.now();
          if (data && data.id) {
            localVehicles[vehicleIndex].serverId = data.id;
          }
        }

        // Mark queue item as completed
        updatedQueue[itemIndex].status = 'completed';
        updatedQueue[itemIndex].updatedAt = Date.now();
        synced++;
      } catch (error) {
        console.error(`Error syncing queue item ${item.id}:`, error);
        
        // Update retry count and status
        updatedQueue[itemIndex].retryCount = (updatedQueue[itemIndex].retryCount || 0) + 1;
        updatedQueue[itemIndex].errorMessage = error.message || 'Unknown error';
        
        if (updatedQueue[itemIndex].retryCount >= 3) {
          updatedQueue[itemIndex].status = 'failed';
        }
        
        updatedQueue[itemIndex].updatedAt = Date.now();
        failed++;
      }
    }

    // Save updated queue and vehicles
    await saveSyncQueue(updatedQueue);
    await saveLocalVehicles(localVehicles);

    // Clean up completed items older than 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const cleanedQueue = updatedQueue.filter(item => {
      if (item.status === 'completed' && item.updatedAt < oneDayAgo) {
        return false;
      }
      return true;
    });

    if (cleanedQueue.length !== updatedQueue.length) {
      await saveSyncQueue(cleanedQueue);
    }

    return { synced, failed };
  } catch (error) {
    console.error('Error syncing queue:', error);
    throw error;
  }
};

/**
 * Create vehicle (online or offline)
 */
export const createVehicle = async (vehicleData) => {
  try {
    if (isOnline()) {
      // Try to create directly in Supabase
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .insert(vehicleData)
          .select()
          .single();

        if (error) throw error;

        // Also save locally for offline access
        const localVehicles = await getLocalVehicles();
        const localVehicle = {
          id: `server_${data.id}`,
          ...vehicleData,
          serverId: data.id,
          synced: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        localVehicles.push(localVehicle);
        await saveLocalVehicles(localVehicles);

        return { success: true, data, synced: true };
      } catch (error) {
        // If online creation fails, fall back to queue
        console.warn('Online creation failed, queueing:', error);
        return await queueVehicleCreation(vehicleData);
      }
    } else {
      // Offline: queue for later sync
      return await queueVehicleCreation(vehicleData);
    }
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

/**
 * Get pending sync count
 */
export const getPendingSyncCount = async () => {
  try {
    const queue = await getSyncQueue();
    return queue.filter(item => item.status === 'pending').length;
  } catch (error) {
    console.error('Error getting pending sync count:', error);
    return 0;
  }
};

/**
 * Get local vehicles (synced and unsynced)
 */
export const getLocalVehiclesList = async () => {
  try {
    return await getLocalVehicles();
  } catch (error) {
    console.error('Error getting local vehicles list:', error);
    return [];
  }
};
