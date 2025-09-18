export const generateMockReferrer = () => {
  const referrers = ['direct', 'google.com', 'facebook.com', 'twitter.com', 'email'];
  return referrers[Math.floor(Math.random() * referrers.length)];
};

export const generateMockGeo = () => {
  const locations = [
    'New York, US',
    'London, UK', 
    'Tokyo, JP',
    'Sydney, AU',
    'Berlin, DE',
    'Toronto, CA',
    'Mumbai, IN',
    'São Paulo, BR'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

export const createClickRecord = () => ({
  timestamp: new Date().toISOString(),
  referrer: generateMockReferrer(),
  geo: generateMockGeo()
});