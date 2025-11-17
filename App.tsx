import React, { useState, useCallback, useEffect } from 'react';
import { House, NpcType, View, WarehouseItem, PriceConfig, SaleRecord, CollectedPet, Division, AppState, Profile, HouseTemplate, NpcSlot, PetSlot } from './types';
import { INITIAL_HOUSES, INITIAL_WAREHOUSE_ITEMS, CYCLE_TIMES, INITIAL_PRICES, INITIAL_SALES_HISTORY, INITIAL_COLLECTED_PETS, DEFAULT_CHECKIN_TIMES } from './constants';
import * as examples from './examples';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DailyBriefing from './components/DailyBriefing';
import FactoryFloor from './components/FactoryFloor';
import Warehouse from './components/Warehouse';
import PetSales from './components/PetSales';
import HelpModal from './components/HelpModal';
import ScheduleModal from './components/ScheduleModal';
import ProfileModal from './components/ProfileModal';
import ExampleModeControls from './components/ExampleModeControls';
import { ProfileIcon } from './components/icons/Icons';

const calculateAndAssignServiceBlocks = (houses: House[]): House[] => {
    const groupedByDivision: Record<string, House[]> = {};
    for (const house of houses) {
        if (!groupedByDivision[house.division]) {
            groupedByDivision[house.division] = [];
        }
        groupedByDivision[house.division].push(house);
    }

    const updatedHouses: House[] = [];
    Object.keys(groupedByDivision).forEach(division => {
        const divisionHouses = groupedByDivision[division];
        if (division === Division.CHAMPION) {
            divisionHouses.forEach(h => updatedHouses.push({ ...h, serviceBlock: 'Champion' }));
            return;
        }

        const numBlocks = Math.min(3, divisionHouses.length);
        if (numBlocks === 0) return;

        divisionHouses.forEach((house, index) => {
            const blockLetter = String.fromCharCode(65 + (index % numBlocks)); // A, B, C
            updatedHouses.push({ ...house, serviceBlock: `${division} Block ${blockLetter}` });
        });
    });

    return updatedHouses.sort((a, b) => a.id - b.id);
};

const INITIAL_APP_STATE: AppState = {
  houses: INITIAL_HOUSES,
  warehouseItems: INITIAL_WAREHOUSE_ITEMS,
  cashBalance: 490000000,
  prices: INITIAL_PRICES,
  collectedPets: INITIAL_COLLECTED_PETS,
  salesHistory: INITIAL_SALES_HISTORY,
  checkinTimes: DEFAULT_CHECKIN_TIMES,
};

const LoginScreen: React.FC<{
    profiles: Profile[];
    onLogin: (profileId: string, pin: string) => { success: boolean; message?: string };
    onAddProfile: (name: string, pin: string) => void;
}> = ({ profiles, onLogin, onAddProfile }) => {
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [pin, setPin] = useState('');
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfilePin, setNewProfilePin] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    
    useEffect(() => {
        const lastProfileId = localStorage.getItem('flyff-pet-studio-last-profile-id');
        if (lastProfileId && profiles.some(p => p.id === lastProfileId)) {
            setSelectedProfileId(lastProfileId);
        } else if (profiles.length > 0) {
            setSelectedProfileId(profiles[0].id);
        }
    }, [profiles]);

    const handleLoginAttempt = () => {
        setError('');
        const result = onLogin(selectedProfileId, pin);
        if (!result.success) {
            setError(result.message || 'Login failed.');
        }
    };

    const handleCreateAttempt = () => {
        setError('');
        if (!newProfileName.trim()) {
            setError('Profile name cannot be empty.');
            return;
        }
        if (!/^\d{4}$/.test(newProfilePin)) {
            setError('PIN must be exactly 4 digits.');
            return;
        }
        onAddProfile(newProfileName, newProfilePin);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-cyan-400">Flyff Pet Studio</h1>
                    <p className="text-gray-400 mt-2">Select a profile to begin</p>
                </div>
                
                {profiles.length > 0 && !isCreating ? (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="profile-select" className="text-sm font-medium text-gray-300">Profile</label>
                            <select id="profile-select" value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} className="mt-1 w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="pin-input" className="text-sm font-medium text-gray-300">4-Digit PIN</label>
                            <input id="pin-input" type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="Enter PIN (if set)" className="mt-1 w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" onKeyDown={e => e.key === 'Enter' && handleLoginAttempt()} />
                        </div>
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        <button onClick={handleLoginAttempt} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Login</button>
                        <button onClick={() => { setIsCreating(true); setError(''); }} className="w-full text-center text-sm text-cyan-400 hover:underline">Or create a new profile</button>
                    </div>
                ) : (
                     <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-gray-200">Create New Profile</h2>
                        <div>
                            <label htmlFor="new-name" className="text-sm font-medium text-gray-300">Profile Name</label>
                            <input id="new-name" type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} placeholder="e.g., Main Factory" className="mt-1 w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="new-pin" className="text-sm font-medium text-gray-300">4-Digit PIN</label>
                            <input id="new-pin" type="password" value={newProfilePin} onChange={e => setNewProfilePin(e.target.value)} maxLength={4} placeholder="Create a 4-digit PIN" className="mt-1 w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        <button onClick={handleCreateAttempt} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Create and Login</button>
                        {profiles.length > 0 && <button onClick={() => { setIsCreating(false); setError(''); }} className="w-full text-center text-sm text-cyan-400 hover:underline">Back to login</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Profile & Auth State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Playground Mode State
  const [isInExampleMode, setIsInExampleMode] = useState(false);
  const [userSavedState, setUserSavedState] = useState<AppState | null>(null);
  const [simulatedTime, setSimulatedTime] = useState<number | null>(null);

  useEffect(() => {
    try {
        const savedProfilesJSON = localStorage.getItem('flyff-pet-studio-profiles');
        let profilesToLoad: Profile[] = savedProfilesJSON ? JSON.parse(savedProfilesJSON) : [];
        setProfiles(profilesToLoad);
    } catch (error) {
        console.error("Failed to load profiles from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (isInExampleMode || !currentProfileId || !isAuthenticated) return;

    const profileToUpdate = profiles.find(p => p.id === currentProfileId);
    if (profileToUpdate && JSON.stringify(profileToUpdate.data) === JSON.stringify(appState)) {
      return; // No changes to save
    }

    const updatedProfiles = profiles.map(p =>
      p.id === currentProfileId ? { ...p, data: appState, lastSaved: Date.now() } : p
    );
    setProfiles(updatedProfiles);
    localStorage.setItem('flyff-pet-studio-profiles', JSON.stringify(updatedProfiles));
  }, [appState, currentProfileId, isAuthenticated, isInExampleMode, profiles]);

  const loadExample = (exampleData: any) => {
      setAppState({
          houses: exampleData.houses,
          warehouseItems: exampleData.warehouseItems,
          cashBalance: exampleData.cashBalance,
          collectedPets: exampleData.collectedPets,
          salesHistory: exampleData.salesHistory,
          prices: appState.prices, 
          checkinTimes: appState.checkinTimes,
      });
  };

  const enterExampleMode = () => {
    setUserSavedState(appState);
    setIsInExampleMode(true);
    setSimulatedTime(Date.now());
    loadExample(examples.EXAMPLE_2_HOUSE);
  };

  const exitExampleMode = () => {
    if (userSavedState) {
        setAppState(userSavedState);
    }
    setIsInExampleMode(false);
    setUserSavedState(null);
    setSimulatedTime(null);
  };

  const handleLogin = (profileId: string, pin: string): { success: boolean; message?: string } => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return { success: false, message: "Profile not found." };

    if (!profile.pin || profile.pin === pin) {
        setCurrentProfileId(profile.id);
        setAppState(profile.data);
        setIsAuthenticated(true);
        localStorage.setItem('flyff-pet-studio-last-profile-id', profile.id);
        return { success: true };
    } else {
        return { success: false, message: "Invalid PIN." };
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentProfileId(null);
      setAppState(INITIAL_APP_STATE);
  };

  const setHouses = useCallback((updater: React.SetStateAction<House[]>) => {
    setAppState(prev => {
        const newHouses = typeof updater === 'function' ? updater(prev.houses) : updater;
        return { ...prev, houses: newHouses };
    });
  }, []);

  const updateHouse = useCallback((updatedHouse: House) => {
    setAppState(prev => {
        const newHouses = prev.houses.map(h => (h.id === updatedHouse.id ? updatedHouse : h));
        const oldHouse = prev.houses.find(h => h.id === updatedHouse.id);
        if (oldHouse && oldHouse.division !== updatedHouse.division) {
            return { ...prev, houses: calculateAndAssignServiceBlocks(newHouses) };
        }
        return { ...prev, houses: newHouses };
    });
  }, []);

  const addHousesFromTemplate = useCallback((template: HouseTemplate, quantity: number) => {
    setAppState(prev => {
        const newHouses: House[] = [];
        let lastId = prev.houses.length > 0 ? Math.max(...prev.houses.map(h => h.id)) : 0;

        for (let i = 0; i < quantity; i++) {
            const newId = ++lastId;
            
            const createSlot = (type: NpcType | null): { npc: NpcSlot; pet: PetSlot } => ({
                npc: {
                    type,
                    expiration: null,
                    duration: type ? 15 : null,
                },
                pet: { name: null, startTime: null, finishTime: null },
            });

            let newHouseConfig: { division: Division; slots: { npc: NpcSlot; pet: PetSlot }[] };

            switch (template) {
                case HouseTemplate.A_NURSERY:
                    newHouseConfig = {
                        division: Division.NURSERY,
                        slots: [createSlot(NpcType.F), createSlot(NpcType.E), createSlot(null)],
                    };
                    break;
                case HouseTemplate.S_NURSERY:
                    newHouseConfig = {
                        division: Division.NURSERY,
                        slots: [createSlot(NpcType.F), createSlot(NpcType.E), createSlot(NpcType.D)],
                    };
                    break;
                case HouseTemplate.A_FACTORY:
                    newHouseConfig = {
                        division: Division.FACTORY,
                        slots: [createSlot(NpcType.D), createSlot(NpcType.C), createSlot(NpcType.B)],
                    };
                    break;
                case HouseTemplate.S_FACTORY:
                    newHouseConfig = {
                        division: Division.FACTORY,
                        slots: [createSlot(NpcType.C), createSlot(NpcType.B), createSlot(NpcType.A)],
                    };
                    break;
                case HouseTemplate.EMPTY:
                    newHouseConfig = {
                        division: Division.NURSERY,
                        slots: [createSlot(null), createSlot(null), createSlot(null)],
                    };
                    break;
            }

            const newHouse: House = {
                id: newId,
                division: newHouseConfig.division,
                serviceBlock: '',
                perfectionAttempts: 0,
                slots: newHouseConfig.slots,
            };
            newHouses.push(newHouse);
        }
        
        return { ...prev, houses: calculateAndAssignServiceBlocks([...prev.houses, ...newHouses]) };
    });
  }, []);

  const removeHouse = useCallback((houseId: number) => {
    setAppState(prev => ({ ...prev, houses: calculateAndAssignServiceBlocks(prev.houses.filter(h => h.id !== houseId)) }));
  }, []);

  const setWarehouseItems = useCallback((updater: React.SetStateAction<WarehouseItem[]>) => {
      setAppState(prev => {
          const newItems = typeof updater === 'function' ? updater(prev.warehouseItems) : updater;
          return { ...prev, warehouseItems: newItems };
      });
  }, []);
  
  const updateWarehouseItem = useCallback((updatedItem: WarehouseItem) => {
    setAppState(prev => ({ ...prev, warehouseItems: prev.warehouseItems.map(item => (item.id === updatedItem.id ? updatedItem : item)) }));
  }, []);
  
  const setCashBalance = useCallback((balance: number) => {
    setAppState(prev => ({ ...prev, cashBalance: balance }));
  }, []);

  const setPrices = useCallback((newPrices: PriceConfig) => {
    setAppState(prev => ({ ...prev, prices: newPrices }));
  }, []);
  
  const updateCollectedPets = useCallback((petType: NpcType, quantity: number) => {
    setAppState(prev => {
        let newCollectedPets: CollectedPet[];
        const existing = prev.collectedPets.find(p => p.petType === petType);
        if (existing) {
            newCollectedPets = prev.collectedPets.map(p => 
                p.petType === petType ? { ...p, quantity: p.quantity + quantity } : p
            ).filter(p => p.quantity > 0);
        } else if (quantity > 0) {
            newCollectedPets = [...prev.collectedPets, { petType, quantity }];
        } else {
            newCollectedPets = prev.collectedPets;
        }
        return { ...prev, collectedPets: newCollectedPets };
    });
  }, []);
  
  const handleSellPets = useCallback((petType: NpcType, quantity: number, pricePerUnit: number) => {
    updateCollectedPets(petType, -quantity);
    const totalValue = quantity * pricePerUnit;
    setAppState(prev => {
      const newRecord: SaleRecord = { 
        id: crypto.randomUUID(), petType, quantity, pricePerUnit, totalValue, timestamp: Date.now() 
      };
      return {
        ...prev,
        cashBalance: prev.cashBalance + totalValue,
        salesHistory: [newRecord, ...prev.salesHistory],
      }
    });
  }, [updateCollectedPets]);
  
  const handlePerfectionAttempt = useCallback(() => {
    const championHouse = appState.houses.find(h => h.division === Division.CHAMPION);
    const sPets = appState.collectedPets.find(p => p.petType === NpcType.S);

    if (championHouse && sPets && sPets.quantity > 0) {
        updateCollectedPets(NpcType.S, -1);
        const updatedChampionHouse = { ...championHouse, perfectionAttempts: championHouse.perfectionAttempts + 1 };
        updateHouse(updatedChampionHouse);
    } else {
        alert("No S-Pets available in inventory to attempt perfection.");
    }
  }, [appState.houses, appState.collectedPets, updateCollectedPets, updateHouse]);

  const setCheckinTimes = useCallback((times: number[]) => {
      setAppState(prev => ({ ...prev, checkinTimes: times }));
  }, []);

  // FIX: Implement handleTimeTravel to control the simulated time in playground mode.
  const handleTimeTravel = useCallback((amount: number, unit: 'day' | 'week') => {
    setSimulatedTime(prev => {
      if (prev === null) return null;
      const msInDay = 24 * 60 * 60 * 1000;
      let msToAdd = 0;
      if (unit === 'day') {
        msToAdd = amount * msInDay;
      } else if (unit === 'week') {
        msToAdd = amount * 7 * msInDay;
      }
      return prev + msToAdd;
    });
  }, []);

  // FIX: Implement handleSkipToCheckin to jump between check-in times in playground mode.
  const handleSkipToCheckin = useCallback((direction: 'forward' | 'backward') => {
    if (simulatedTime === null || appState.checkinTimes.length === 0) return;

    const now = new Date(simulatedTime);
    const sortedCheckinHours = [...appState.checkinTimes].sort((a, b) => a - b);

    const checkinDates: Date[] = [];
    [-2, -1, 0, 1, 2].forEach(dayOffset => {
        sortedCheckinHours.forEach(hour => {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, 0, 0, 0);
            checkinDates.push(date);
        });
    });

    if (direction === 'forward') {
        const nextCheckin = checkinDates
            .sort((a, b) => a.getTime() - b.getTime())
            .find(time => time.getTime() > now.getTime());
        
        if (nextCheckin) {
            setSimulatedTime(nextCheckin.getTime());
        }
    } else { // backward
        const prevCheckin = checkinDates
            .sort((a, b) => b.getTime() - a.getTime())
            .find(time => time.getTime() < now.getTime());

        if (prevCheckin) {
            setSimulatedTime(prevCheckin.getTime());
        }
    }
  }, [simulatedTime, appState.checkinTimes]);

  const handleAddProfile = (name: string, pin: string) => {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      pin,
      lastSaved: Date.now(),
      data: INITIAL_APP_STATE
    };
    const newProfiles = [...profiles, newProfile];
    setProfiles(newProfiles);
    localStorage.setItem('flyff-pet-studio-profiles', JSON.stringify(newProfiles));
    handleLogin(newProfile.id, pin);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
        alert("Cannot delete the last profile.");
        return;
    }
    const newProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(newProfiles);
    localStorage.setItem('flyff-pet-studio-profiles', JSON.stringify(newProfiles));
    if (currentProfileId === profileId) {
        handleLogout();
    }
  };

  const handleUpdatePin = (profileId: string, newPin: string) => {
     const updatedProfiles = profiles.map(p =>
      p.id === profileId ? { ...p, pin: newPin, lastSaved: Date.now() } : p
    );
    setProfiles(updatedProfiles);
    localStorage.setItem('flyff-pet-studio-profiles', JSON.stringify(updatedProfiles));
  };
  
  const renderView = () => {
    const { houses, warehouseItems, cashBalance, prices, collectedPets, salesHistory, checkinTimes } = appState;
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard 
            houses={houses} warehouseItems={warehouseItems} cashBalance={cashBalance}
            setCashBalance={setCashBalance} cycleTimes={CYCLE_TIMES} prices={prices}
            checkinTimes={checkinTimes} collectedPets={collectedPets} onPerfectionAttempt={handlePerfectionAttempt}
        />;
      case View.DAILY_BRIEFING:
        return <DailyBriefing 
            houses={houses} cycleTimes={CYCLE_TIMES} warehouseItems={warehouseItems}
            onUpdateCollectedPets={updateCollectedPets} setHouses={setHouses}
            setWarehouseItems={setWarehouseItems} checkinTimes={checkinTimes} simulatedTime={simulatedTime}
        />;
      case View.FACTORY_FLOOR:
        return <FactoryFloor
            houses={houses} onUpdateHouse={updateHouse} cycleTimes={CYCLE_TIMES} onSetHouses={setHouses}
            onAddHousesFromTemplate={addHousesFromTemplate} onRemoveHouse={removeHouse} simulatedTime={simulatedTime}
        />;
      case View.WAREHOUSE:
        return <Warehouse items={warehouseItems} onUpdateItem={updateWarehouseItem} />;
      case View.PET_SALES:
        return <PetSales
            prices={prices} onUpdatePrices={setPrices} collectedPets={collectedPets}
            salesHistory={salesHistory} onSellPets={handleSellPets}
        />;
      default: return null;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen profiles={profiles} onLogin={handleLogin} onAddProfile={handleAddProfile} />;
  }

  const currentProfileName = profiles.find(p => p.id === currentProfileId)?.name || "Loading...";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        currentView={currentView} setCurrentView={setCurrentView}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onSettingsClick={() => setIsScheduleModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        isInExampleMode={isInExampleMode}
        onEnterExampleMode={enterExampleMode}
        onExitExampleMode={exitExampleMode}
        currentProfileName={currentProfileName}
      />
      {isInExampleMode && 
        <ExampleModeControls 
            onSelectExample={loadExample}
            simulatedTime={simulatedTime}
            onSkipToCheckin={handleSkipToCheckin}
            onTimeTravel={handleTimeTravel}
        />}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-full mx-auto w-full">
        {renderView()}
      </main>
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
      {isScheduleModalOpen && <ScheduleModal 
        onClose={() => setIsScheduleModalOpen(false)}
        checkinTimes={appState.checkinTimes}
        onUpdateCheckinTimes={setCheckinTimes}
        houses={appState.houses}
        cycleTimes={CYCLE_TIMES}
        prices={appState.prices}
      />}
      {isProfileModalOpen && <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        currentProfileId={currentProfileId}
        onLoadProfile={(id) => { handleLogout(); handleLogin(id, ''); }} // Logout then attempt login
        onAddProfile={handleAddProfile}
        onDeleteProfile={handleDeleteProfile}
        onUpdatePin={handleUpdatePin}
       />}
    </div>
  );
};

export default App;