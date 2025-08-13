const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// In-memory storage for demo
let users = [
  { id: 1, username: 'owner1', password: 'pass', role: 'owner', contact: 'owner1@example.com' },
  { id: 2, username: 'coworker1', password: 'pass', role: 'coworker' }
];
let properties = [];
let workspaces = [];
let propertyIdCounter = 1;
let workspaceIdCounter = 1;

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  res.json({ success: true, user: { id: user.id, role: user.role, contact: user.contact } });
});


// Add property (owner only)
app.post('/properties', (req, res) => {
  const { ownerId, address, neighborhood, sqft, garage, publicTransport } = req.body;
  if (!ownerId || !address || !neighborhood || !sqft) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const newProperty = {
    id: propertyIdCounter++,
    ownerId,
    address,
    neighborhood,
    sqft,
    garage: !!garage,
    publicTransport: !!publicTransport,
  };
  properties.push(newProperty);
  res.json({ success: true, property: newProperty });
});

// Edit property (owner only)
app.put('/properties/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const property = properties.find(p => p.id === id);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  const { ownerId, address, neighborhood, sqft, garage, publicTransport } = req.body;
  if (ownerId !== property.ownerId) return res.status(403).json({ success: false, message: 'Forbidden' });

  if (address) property.address = address;
  if (neighborhood) property.neighborhood = neighborhood;
  if (sqft) property.sqft = sqft;
  if (garage !== undefined) property.garage = !!garage;
  if (publicTransport !== undefined) property.publicTransport = !!publicTransport;

  res.json({ success: true, property });
});

// Delete property (owner only)
app.delete('/properties/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const propertyIndex = properties.findIndex(p => p.id === id);
  if (propertyIndex === -1) return res.status(404).json({ success: false, message: 'Property not found' });
  
  properties.splice(propertyIndex, 1);
  workspaces = workspaces.filter(w => w.propertyId !== id);
  res.json({ success: true });
});

// Get properties for owner
app.get('/properties/owner/:ownerId', (req, res) => {
  const ownerId = parseInt(req.params.ownerId);
  const props = properties.filter(p => p.ownerId === ownerId);
  res.json({ success: true, properties: props });
});

// Get all properties (for coworker search)
app.get('/properties', (req, res) => {
  // Could add filters here
  res.json({ success: true, properties });
});

//  WORKSPACES 
// Add workspace to property (owner only)
app.post('/properties/:propertyId/workspaces', (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  const property = properties.find(p => p.id === propertyId);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

  const { meetingRoom, privateOffice, openDesk, seats, smoking, availability, term, price } = req.body;

  const newWorkspace = {
    id: workspaceIdCounter++,
    propertyId,
    meetingRoom: !!meetingRoom,
    privateOffice: !!privateOffice,
    openDesk: !!openDesk,
    seats: seats || 0,
    smoking: !!smoking,
    availability: availability || 'Available',
    term: term || 'd',
    price: price || 0
  };
  workspaces.push(newWorkspace);
  res.json({ success: true, workspace: newWorkspace });
});

// Edit workspace (owner only)
app.put('/workspaces/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const workspace = workspaces.find(w => w.id === id);
  if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

  const property = properties.find(p => p.id === workspace.propertyId);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

  const { meetingRoom, privateOffice, openDesk, seats, smoking, availability, term, price, ownerId } = req.body;
  if (ownerId !== property.ownerId) return res.status(403).json({ success: false, message: 'Forbidden' });

  if (meetingRoom !== undefined) workspace.meetingRoom = !!meetingRoom;
  if (privateOffice !== undefined) workspace.privateOffice = !!privateOffice;
  if (openDesk !== undefined) workspace.openDesk = !!openDesk;
  if (seats !== undefined) workspace.seats = seats;
  if (smoking !== undefined) workspace.smoking = !!smoking;
  if (availability !== undefined) workspace.availability = availability;
  if (term !== undefined) workspace.term = term;
  if (price !== undefined) workspace.price = price;

  res.json({ success: true, workspace });
});

// Delete workspace (owner only)
app.delete('/workspaces/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = workspaces.findIndex(w => w.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Workspace not found' });
  workspaces.splice(index, 1);
  res.json({ success: true });
});

// Get workspaces for a property
app.get('/properties/:propertyId/workspaces', (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  const ws = workspaces.filter(w => w.propertyId === propertyId);
  res.json({ success: true, workspaces: ws });
});

// Search workspaces with filters (for coworker)
app.get('/search', (req, res) => {
  const { address, neighborhood, sqft, garage, publicTransport, seats, smoking, availability, term, priceMax } = req.query;

  let filteredProperties = properties;

  if (address) filteredProperties = filteredProperties.filter(p => p.address.toLowerCase().includes(address.toLowerCase()));
  if (neighborhood) filteredProperties = filteredProperties.filter(p => p.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
  if (sqft) filteredProperties = filteredProperties.filter(p => p.sqft >= parseInt(sqft));
  if (garage) filteredProperties = filteredProperties.filter(p => p.garage === (garage === 'true'));
  if (publicTransport) filteredProperties = filteredProperties.filter(p => p.publicTransport === (publicTransport === 'true'));

  // Filter workspaces by property and workspace criteria
  let filteredWorkspaces = workspaces.filter(w => filteredProperties.some(p => p.id === w.propertyId));

  if (seats) filteredWorkspaces = filteredWorkspaces.filter(w => w.seats >= parseInt(seats));
  if (smoking) filteredWorkspaces = filteredWorkspaces.filter(w => w.smoking === (smoking === 'true'));
  if (availability) filteredWorkspaces = filteredWorkspaces.filter(w => w.availability === availability);
  if (term) filteredWorkspaces = filteredWorkspaces.filter(w => w.term === term);
  if (priceMax) filteredWorkspaces = filteredWorkspaces.filter(w => w.price <= parseFloat(priceMax));

  // Combine workspace with property info for response
  const results = filteredWorkspaces.map(w => {
    const property = properties.find(p => p.id === w.propertyId);
    return { workspace: w, property };
  });

  res.json({ success: true, results });
});

// Get workspace details including owner contact
app.get('/workspaces/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const workspace = workspaces.find(w => w.id === id);
  if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

  const property = properties.find(p => p.id === workspace.propertyId);
  const owner = users.find(u => u.id === property.ownerId);

  res.json({ success: true, workspace, property, ownerContact: owner ? owner.contact : null });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
