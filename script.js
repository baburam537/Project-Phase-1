$(document).ready(function() {
  const searchInput = $(".search-bar input");
  const propertyCards = $(".property-card");

  searchInput.on("input", function() {
    const searchValue = searchInput.val().toLowerCase();
    propertyCards.each(function() {
      const card = $(this);
      const title = card.find("h4").text().toLowerCase();
      if (title.includes(searchValue)) {
        card.css("display", "block");
      } else {
        card.css("display", "none");
      }
    });
  });
  const viewDetailsLinks = $(".property-card a");
  viewDetailsLinks.on("click", function(event) {
    event.preventDefault();
    const propertyName = $(this).closest(".property-card").find("h4").text();
    alert("Viewing details for: " + propertyName);
  });
});