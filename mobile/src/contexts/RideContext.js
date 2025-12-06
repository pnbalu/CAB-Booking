import React, { createContext, useState, useContext } from 'react';

const RideContext = createContext();

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

export const RideProvider = ({ children }) => {
  const [activeRide, setActiveRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [availableRides, setAvailableRides] = useState([]);

  const requestRide = (pickup, destination, rideType = 'standard', stops = [], driver = null) => {
    const newRide = {
      id: Date.now().toString(),
      pickup,
      destination,
      stops,
      rideType,
      status: driver ? 'driver_assigned' : 'searching',
      driver: driver,
      fare: calculateFare(pickup, destination, rideType, stops),
      createdAt: new Date().toISOString(),
    };
    
    setActiveRide(newRide);
    return newRide;
  };

  const calculateFare = (pickup, destination, rideType, stops = []) => {
    const baseFare = rideType === 'premium' ? 15 : 10;
    const distance = Math.random() * 10 + 5;
    const stopsFee = stops.length * 3; // $3 per stop
    const fare = baseFare + distance * 2 + stopsFee;
    return Math.round(fare * 100) / 100;
  };

  const assignDriver = (rideId, driver) => {
    if (activeRide && activeRide.id === rideId) {
      setActiveRide({
        ...activeRide,
        driver,
        status: 'driver_assigned',
      });
    }
  };

  const updateRideStatus = (rideId, status) => {
    if (activeRide && activeRide.id === rideId) {
      setActiveRide({
        ...activeRide,
        status,
      });
    }
  };

  const completeRide = (rideId) => {
    if (activeRide && activeRide.id === rideId) {
      const completedRide = {
        ...activeRide,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      setRideHistory([completedRide, ...rideHistory]);
      setActiveRide(null);
    }
  };

  const cancelRide = (rideId) => {
    if (activeRide && activeRide.id === rideId) {
      const cancelledRide = {
        ...activeRide,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      };
      setRideHistory([cancelledRide, ...rideHistory]);
      setActiveRide(null);
    }
  };

  const addAvailableRide = (ride) => {
    setAvailableRides([...availableRides, ride]);
  };

  const removeAvailableRide = (rideId) => {
    setAvailableRides(availableRides.filter(ride => ride.id !== rideId));
  };

  const acceptRide = (rideId) => {
    const ride = availableRides.find(r => r.id === rideId);
    if (ride) {
      removeAvailableRide(rideId);
      return ride;
    }
    return null;
  };

  const value = {
    activeRide,
    rideHistory,
    availableRides,
    requestRide,
    assignDriver,
    updateRideStatus,
    completeRide,
    cancelRide,
    addAvailableRide,
    removeAvailableRide,
    acceptRide,
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

