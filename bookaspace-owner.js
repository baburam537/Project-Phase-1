const API_BASE = 'http://localhost:3000';
const userId = parseInt(localStorage.getItem('userId')) || 1; 

const propertyForm = document.getElementById('ownerPropertyForm');
const workspaceForm = document.getElementById('ownerWorkspaceForm');
const propertySelect = document.getElementById('propertySelect');
const ownerListings = document.getElementById('ownerListings');

let properties = [];
let workspaces = [];

async function loadProperties() {
  try {
    const res = await fetch(`${API_BASE}/properties/owner/${userId}`);
    const data = await res.json();
    if (data.success) {
      properties = data.properties;
      await loadWorkspacesForProperties();
      updatePropertySelect();
      displayListings();
    } else {
      alert(data.message || 'Failed to load properties');
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadWorkspacesForProperties() {
  // Fetch workspaces for all properties
  workspaces = [];
  for (const prop of properties) {
    try {
      const res = await fetch(`${API_BASE}/properties/${prop.id}/workspaces`);
      const data = await res.json();
      if (data.success) {
        workspaces.push(...data.workspaces.map(w => ({ ...w, propertyId: prop.id })));
      }
    } catch (err) {
      console.error(err);
    }
  }
}

function updatePropertySelect() {
  propertySelect.innerHTML = '';
  properties.forEach(prop => {
    const opt = document.createElement('option');
    opt.value = prop.id;
    opt.textContent = prop.address || prop.name || `Property #${prop.id}`;
    propertySelect.appendChild(opt);
  });
}

function displayListings() {
  ownerListings.innerHTML = '';
  properties.forEach(prop => {
    const div = document.createElement('div');
    div.className = 'property';
    const propWorkspaces = workspaces.filter(w => w.propertyId === prop.id);
    div.innerHTML = `
      <h3>${prop.address || prop.name || 'Unnamed Property'}</h3>
      <p><strong>Neighborhood:</strong> ${prop.neighborhood || 'N/A'}</p>
      <p><strong>Square Footage:</strong> ${prop.sqft || 'N/A'}</p>
      <p><strong>Garage:</strong> ${prop.garage ? 'Yes' : 'No'}</p>
      <p><strong>Public Transport:</strong> ${prop.publicTransport ? 'Yes' : 'No'}</p>
      <h4>Workspaces:</h4>
      <ul>
        ${propWorkspaces.length > 0 ? propWorkspaces.map(w => 
          `<li>
            Type: ${w.meetingRoom ? 'Meeting Room' : w.privateOffice ? 'Private Office' : w.openDesk ? 'Open Desk' : 'Unknown'}, 
            Seats: ${w.seats}, Smoking: ${w.smoking ? 'Yes' : 'No'}, 
            Availability: ${w.availability}, Term: ${w.term}, Price: $${w.price}
          </li>`).join('') : '<li>No workspaces added yet</li>'}
      </ul>
    `;
    ownerListings.appendChild(div);
  });
}

propertyForm.addEventListener('submit', async e => {
  e.preventDefault();
  const propertyData = {
    ownerId: userId,
    address: e.target.address.value,
    neighborhood: e.target.neighborhood.value,
    sqft: parseInt(e.target.sqft.value),
    garage: e.target.garage.checked,
    publicTransport: e.target.publicTransport.checked
  };

  try {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    const data = await res.json();
    if (data.success) {
      alert('Property added successfully!');
      e.target.reset();
      await loadProperties();
    } else {
      alert(data.message || 'Failed to add property');
    }
  } catch (err) {
    console.error(err);
  }
});

workspaceForm.addEventListener('submit', async e => {
  e.preventDefault();

  const propertyId = parseInt(propertySelect.value);
  if (!propertyId) {
    alert('Please select a property first.');
    return;
  }

  const workspaceData = {
    meetingRoom: e.target.meetingRoom.checked,
    privateOffice: e.target.privateOffice.checked,
    openDesk: e.target.openDesk.checked,
    seats: parseInt(e.target.seats.value),
    smoking: e.target.smoking.checked,
    availability: e.target.availability.value,
    term: e.target.term.value,
    price: parseFloat(e.target.price.value)
  };

  try {
    const res = await fetch(`${API_BASE}/properties/${propertyId}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workspaceData)
    });
    const data = await res.json();
    if (data.success) {
      alert('Workspace added successfully!');
      e.target.reset();
      await loadProperties();
    } else {
      alert(data.message || 'Failed to add workspace');
    }
  } catch (err) {
    console.error(err);
  }
});
loadProperties();
