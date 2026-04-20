import { AppDataSource } from '../config/data-source';
import { ParkingSpace } from '../entities/ParkingSpace';
import { AppError } from '../utils/response';

// Mock data matching frontend structure
const MOCK_PARKING_SPACES = [
  {
    name: 'Downtown Parking Hub',
    rating: 4.5,
    distanceKm: 0.5,
    isOpen: true,
    availabilityText: '45/100 spots available',
    address: '123 Main Street',
    area: 'Downtown',
    city: 'San Francisco',
    hourlyRate: 5.99,
    convenienceFee: 2.0,
    monthlyPlans: [
      { id: 'plan_1', name: '10 Hours', price: 45.0 },
      { id: 'plan_2', name: '30 Hours', price: 120.0 },
    ],
    spots: [
      { location: 'A1', available: true },
      { location: 'A2', available: true },
      { location: 'A3', available: false },
      { location: 'B1', available: true },
      { location: 'B2', available: true },
    ],
  },
  {
    name: 'Airport Parking Zone',
    rating: 4.2,
    distanceKm: 8.5,
    isOpen: true,
    availabilityText: '120/300 spots available',
    address: '5000 Airport Boulevard',
    area: 'Airport',
    city: 'San Francisco',
    hourlyRate: 3.99,
    convenienceFee: 1.5,
    monthlyPlans: [
      { id: 'plan_3', name: '10 Hours', price: 35.0 },
      { id: 'plan_4', name: '30 Hours', price: 90.0 },
    ],
    spots: [
      { location: 'P1', available: true },
      { location: 'P2', available: true },
      { location: 'P3', available: true },
      { location: 'P4', available: false },
    ],
  },
  {
    name: 'Marina Street Parking',
    rating: 4.7,
    distanceKm: 1.2,
    isOpen: true,
    availabilityText: '12/50 spots available',
    address: '890 Marina Way',
    area: 'Marina',
    city: 'San Francisco',
    hourlyRate: 7.99,
    convenienceFee: 2.5,
    monthlyPlans: [
      { id: 'plan_5', name: '10 Hours', price: 60.0 },
      { id: 'plan_6', name: '30 Hours', price: 150.0 },
    ],
    spots: [
      { location: 'M1', available: true },
      { location: 'M2', available: false },
      { location: 'M3', available: true },
    ],
  },
  {
    name: 'Market District Garage',
    rating: 4.0,
    distanceKm: 2.1,
    isOpen: true,
    availabilityText: '89/200 spots available',
    address: '456 Market Street',
    area: 'Market District',
    city: 'San Francisco',
    hourlyRate: 4.5,
    convenienceFee: 1.75,
    monthlyPlans: [
      { id: 'plan_7', name: '10 Hours', price: 40.0 },
      { id: 'plan_8', name: '30 Hours', price: 105.0 },
    ],
    spots: [
      { location: 'G1', available: true },
      { location: 'G2', available: true },
      { location: 'G3', available: false },
      { location: 'G4', available: true },
      { location: 'G5', available: true },
    ],
  },
];

// Seed parking spaces (run once on startup)
export const seedParkingSpaces = async (): Promise<void> => {
  const parkingRepo = AppDataSource.getRepository(ParkingSpace);
  const existingCount = await parkingRepo.count();

  if (existingCount === 0) {
    // Create and save all parking spaces
    for (const data of MOCK_PARKING_SPACES) {
      const parking = parkingRepo.create({
        name: data.name,
        rating: data.rating,
        distanceKm: data.distanceKm,
        isOpen: data.isOpen,
        availabilityText: data.availabilityText,
        address: data.address,
        area: data.area,
        city: data.city,
        hourlyRate: data.hourlyRate,
        convenienceFee: data.convenienceFee,
        monthlyPlans: data.monthlyPlans,
        spots: data.spots,
      });
      await parkingRepo.save(parking);
    }
    console.log('✅ Parking spaces seeded');
  } else {
    console.log(`✅ Database already has ${existingCount} parking spaces`);
  }
};

// Get all parking spaces
export const getAllParkingSpaces = async (): Promise<any[]> => {
  const parkingRepo = AppDataSource.getRepository(ParkingSpace);
  const spaces = await parkingRepo.find();

  return spaces.map((space) => ({
    id: space.id,
    name: space.name,
    rating: space.rating,
    distanceKm: space.distanceKm,
    isOpen: space.isOpen,
    availabilityText: space.availabilityText,
    address: space.address,
    area: space.area,
    city: space.city,
    hourlyRate: space.hourlyRate,
    convenienceFee: space.convenienceFee,
    monthlyPlans: space.monthlyPlans,
    spots: space.spots,
  }));
};

// Get parking space by ID
export const getParkingSpaceById = async (parkingId: string): Promise<any> => {
  const parkingRepo = AppDataSource.getRepository(ParkingSpace);
  const space = await parkingRepo.findOne({ where: { id: parkingId } });

  if (!space) {
    throw new AppError('Parking space not found', 404);
  }

  return {
    id: space.id,
    name: space.name,
    rating: space.rating,
    distanceKm: space.distanceKm,
    isOpen: space.isOpen,
    availabilityText: space.availabilityText,
    address: space.address,
    area: space.area,
    city: space.city,
    hourlyRate: space.hourlyRate,
    convenienceFee: space.convenienceFee,
    monthlyPlans: space.monthlyPlans,
    spots: space.spots,
  };
};

// Search parking spaces by area
export const searchParkingByArea = async (area: string): Promise<any[]> => {
  const parkingRepo = AppDataSource.getRepository(ParkingSpace);
  const spaces = await parkingRepo
    .createQueryBuilder('parking')
    .where('parking.area ILIKE :area OR parking.city ILIKE :area', { area: `%${area}%` })
    .getMany();

  return spaces.map((space) => ({
    id: space.id,
    name: space.name,
    rating: space.rating,
    distanceKm: space.distanceKm,
    isOpen: space.isOpen,
    availabilityText: space.availabilityText,
    address: space.address,
    area: space.area,
    city: space.city,
    hourlyRate: space.hourlyRate,
    convenienceFee: space.convenienceFee,
    monthlyPlans: space.monthlyPlans,
    spots: space.spots,
  }));
};
