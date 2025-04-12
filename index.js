function formatDate(date) {
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDisplayDate(dateString) {
  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

async function loadJSON(file) {
  const response = await fetch(`data/${file}.json`);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

function buildExerciseEntry(exercise) {
  let div = '<div class="mapping">';

  if (exercise.name) {
    div += `<p><strong>Nome:</strong> ${exercise.name}</p>`;
  }

  if (exercise.positioning) {
    div += `<p><strong>Posicionamento:</strong> ${exercise.positioning}</p>`;
  }

  if (exercise.strokes) {
    div += `<p><strong>Braçadas:</strong> ${exercise.strokes}</p>`;
  }

  if (exercise.legs) {
    div += `<p><strong>Pernas:</strong> ${exercise.legs}</p>`;
  }

  if (exercise.breathing) {
    div += `<p><strong>Respiração:</strong> ${exercise.breathing}</p>`;
  }

  return (div += "</div>");
}

// Main function to load workout and mapping then display results
async function displayWorkout() {
  try {
    const [plan, exercises] = await Promise.all([
      loadJSON("plan"),
      loadJSON("exercises"),
    ]);
    const todayStr = formatDate(new Date());
    const container = document.getElementById("workoutContainer");

    const workout = plan.find(({ date }) => date === todayStr);

    if (workout) {
      let html = `<h1>Treino para ${formatDisplayDate(workout.date)}</h1>`;
      html += `<h2>Tipo: ${workout.type}</h2>`;

      workout.exercises.forEach((exercise, index) => {
        html += `<div class="exercise">
                       <h3>Exercício ${index + 1}</h3>
                       <p><strong>Descrição:</strong> ${
                         exercise.description
                       }</p>`;

        if (exercise.duration) {
          html += `<p><strong>Duração:</strong> ${exercise.duration} minuto(s)</p>`;
        }

        if (exercise.reps) {
          html += `<p><strong>Repetições:</strong> ${exercise.reps}</p>`;
        }

        if (exercise.intensity) {
          html += `<p><strong>Intensidade:</strong> ${exercise.intensity}</p>`;
        }

        if (exercise.ids) {
          exercise.ids.forEach((id) => {
            const mapping = exercises.find((exercise) => id === exercise.id);

            if (mapping) {
              html += buildExerciseEntry(mapping);
            } else {
              html += `<div class="mapping">
                             <p>Nenhum exercício encontrado para o id: ${id}</p>
                           </div>`;
            }
          });
        }

        html += `</div>`;
      });

      container.innerHTML = html;
    } else {
      container.innerHTML = `<h1>Nenhum treino agendado para hoje (${todayStr})</h1>`;
    }
  } catch (error) {
    console.error("Error loading JSON:", error);
    document.getElementById(
      "workoutContainer"
    ).innerHTML = `<p>Erro ao carregar os dados do treino.</p>`;
  }
}

// Call displayWorkout on page load
displayWorkout();
