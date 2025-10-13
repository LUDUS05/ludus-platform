// Mock booking store for Neumorphic UI

const MOCK_BOOKINGS = [];

export const Booking = {
  async list() {
    return [...MOCK_BOOKINGS];
  },

  async create(booking) {
    const id = `b_${Date.now()}`;
    const record = { id, status: 'confirmed', ...booking };
    MOCK_BOOKINGS.push(record);
    return record;
  }
};

