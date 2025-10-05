
export const LowSync = jest.fn(() => ({
    read: jest.fn(),
    write: jest.fn(),
    data: jest.fn(() => ({}))
}));