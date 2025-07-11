document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const card = document.createElement("div");
        card.className = "activity-card";
        
        const participantsList = details.participants && details.participants.length > 0
          ? details.participants.map(email => 
              `<li>
                ${email}
                <button class="delete-participant" data-activity="${name}" data-email="${email}">×</button>
              </li>`
            ).join("")
          : '<li class="no-participants">Nenhum participante inscrito</li>';

        card.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p>Horário: ${details.schedule}</p>
          <div class="participants-section">
            <strong>Participantes (${details.participants ? details.participants.length : 0}/${details.max_participants}):</strong>
            <ul class="participants-list">
              ${participantsList}
            </ul>
          </div>
        `;

        activitiesList.appendChild(card);

        // Adicionar opção ao select
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Adicionar event listeners para os botões de deletar
      document.querySelectorAll('.delete-participant').forEach(button => {
        button.addEventListener('click', handleParticipantRemoval);
      });

    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Por favor, tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
  }

  // Function to handle participant removal
  async function handleParticipantRemoval(event) {
    const activity = event.target.dataset.activity;
    const email = event.target.dataset.email;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/remove?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        messageDiv.textContent = "Participante removido com sucesso!";
        messageDiv.className = "message success";
        fetchActivities(); // Atualiza a lista
      } else {
        const error = await response.json();
        messageDiv.textContent = error.detail || "Erro ao remover participante.";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);

    } catch (error) {
      messageDiv.textContent = "Erro ao remover participante. Por favor, tente novamente.";
      messageDiv.className = "message error";
      console.error("Erro ao remover participante:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a lista de atividades
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na inscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na inscrição:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
