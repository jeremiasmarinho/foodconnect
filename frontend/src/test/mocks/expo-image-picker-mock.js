module.exports = {
  MediaTypeOptions: { Images: "Images", Videos: "Videos", All: "All" },
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: "file:///mock-image.jpg" }],
  })),
  launchCameraAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: "file:///mock-photo.jpg" }],
  })),
};
