const API_BASE = 'http://localhost:3000';

const searchForm = document.getElementById('coworkerSearchForm');
const resultsContainer = document.getElementById('searchResults');

async function searchWorkspaces(filters) {
  const query = new URLSearchParams();

  
  for (const key in filters) {
    if (filters[key]) {
      query.append(key, filters[key]);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/search?${query.toString()}`);
    const data = await res.json();
    if (data.success) {
      return data.results;
    } else {
      alert(data.message || 'Search failed');
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderResults(results) {
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No workspaces found matching your criteria.</p>';
    return;
  }

  results.forEach(({ workspace, property }) => {
    const div = document.createElement('div');
    div.className = 'workspace-result';

    div.innerHTML = `
      <h3>Property: ${property.address}</h3>
      <p><strong>Neighborhood:</strong> ${property.neighborhood || 'N/A'}</p>
      <p><strong>Square Footage:</strong> ${property.sqft || 'N/A'}</p>
      <p><strong>Garage:</strong> ${property.garage ? 'Yes' : 'No'}</p>
      <p><strong>Public Transport:</strong> ${property.publicTransport ? 'Yes' : 'No'}</p>
      <hr>
      <p><strong>Workspace Type:</strong> ${workspace.meetingRoom ? 'Meeting Room' : workspace.privateOffice ? 'Private Office' : workspace.openDesk ? 'Open Desk' : 'Unknown'}</p>
      <p><strong>Seats:</strong> ${workspace.seats}</p>
      <p><strong>Smoking Allowed:</strong> ${workspace.smoking ? 'Yes' : 'No'}</p>
      <p><strong>Availability:</strong> ${workspace.availability}</p>
      <p><strong>Term:</strong> ${workspace.term}</p>
      <p><strong>Price:</strong> $${workspace.price}</p>
      <button class="view-details-btn" data-id="${workspace.id}">View Owner Contact</button>
      <div class="owner-contact" id="contact-${workspace.id}" style="display:none;"></div>
    `;

    resultsContainer.appendChild(div);
  });

  // Add event listeners for contact buttons
  document.querySelectorAll('.view-details-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const contactDiv = document.getElementById(`contact-${id}`);
      if (contactDiv.style.display === 'block') {
        contactDiv.style.display = 'none';
        contactDiv.textContent = '';
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/workspaces/${id}`);
        const data = await res.json();
        if (data.success) {
            contactDiv.textContent = `Owner Contact: ${data.ownerContact || 'Not available'}`;
          contactDiv.style.display = 'block';
        } else {
          alert(data.message || 'Failed to fetch contact');
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
}

searchForm.addEventListener('submit', async e => {
  e.preventDefault();

  const filters = {
    address: e.target.address.value.trim(),
    neighborhood: e.target.neighborhood.value.trim(),
    sqft: e.target.sqft.value,
    garage: e.target.garage.checked ? 'true' : '',
    publicTransport: e.target.publicTransport.checked ? 'true' : '',
    seats: e.target.seats.value,
    smoking: e.target.smoking.checked ? 'true' : '',
    availability: e.target.availability.value,
    term: e.target.term.value,
    priceMax: e.target.priceMax.value,
  };

  const results = await searchWorkspaces(filters);
  renderResults(results);
});
