const firebaseConfig = {
    apiKey: "AIzaSyDG2IX1ea9BPeVCJFcHhojNo4KGg7doETk",
    authDomain: "test-4d081.firebaseapp.com",
    projectId: "test-4d081",
    storageBucket: "test-4d081.appspot.com",
    messagingSenderId: "887829314483",
    appId: "1:887829314483:web:389a665bf0f32ed5af69c6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoInfo = document.getElementById('todo-info');
    const todoMaps = document.getElementById('todo-maps');
    const todoList = document.getElementById('todo-list');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editInput = document.getElementById('edit-input');
    const editDate = document.getElementById('edit-date');
    const closeModalBtn = document.querySelector('.close-btn');
    const infoModal = document.getElementById('info-modal');
    const infoDetails = document.getElementById('info-details');
    const infoLink = document.getElementById('info-link');
    const closeInfoModalBtn = document.querySelector('.close-info-btn');
    let currentDocId = null;

    function formatDate(date) {
        if (!date) return "Per determinar";
        const d = new Date(date);
        let day = '' + d.getDate();
        let month = '' + (d.getMonth() + 1);
        const year = d.getFullYear().toString().slice(-2);

        return [day.padStart(2, '0'), month.padStart(2, '0'), year].join('/');
    }

    function renderTask(doc) {
        const listItem = document.createElement('li');
        const taskDetails = document.createElement('div');
        taskDetails.classList.add('task-details');
        taskDetails.textContent = `${doc.data().task} - ${formatDate(doc.data().date)}`;
        listItem.appendChild(taskDetails);
        listItem.setAttribute('data-id', doc.id);
        if (doc.data().completed) {
            listItem.classList.add('completed');
        }
        if (doc.data().archived) {
            listItem.classList.add('archived'); // Add a class for styling if archived
        }

        const archiveButton = document.createElement('button');
        archiveButton.innerHTML = '<i class="fas fa-archive"></i>'; // Change icon to indicate archiving
        archiveButton.classList.add('archive-btn');
        archiveButton.addEventListener('click', () => {
            db.collection('todos').doc(doc.id).update({
                archived: true // Update the archived status
            }).then(() => {
                console.log('Task archived');
            }).catch((error) => {
                console.error('Error archiving task: ', error);
            });
        });

        const completeButton = document.createElement('button');
        completeButton.innerHTML = '<i class="fas fa-check"></i>';
        completeButton.classList.add('complete-btn');
        completeButton.addEventListener('click', () => {
            const completed = !doc.data().completed;
            db.collection('todos').doc(doc.id).update({
                completed: completed
            });
        });

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-pen"></i>';
        editButton.classList.add('edit-btn');
        editButton.addEventListener('click', () => {
            editModal.style.display = 'block';
            editInput.value = doc.data().task;
            editDate.value = doc.data().date || '';
            document.getElementById('edit-info').value = doc.data().info || ''; 
            document.getElementById('edit-maps').value = doc.data().mapsLink || '';
            currentDocId = doc.id;
        });

        const infoButton = document.createElement('button');
        infoButton.innerHTML = '<i class="fas fa-info"></i>';
        infoButton.classList.add('info-btn');
        infoButton.addEventListener('click', () => {
            const taskInfo = doc.data().info || 'No additional info provided.';
            const mapsLink = doc.data().mapsLink || '#';
            infoDetails.textContent = taskInfo;
            infoLink.href = mapsLink;
            infoModal.style.display = 'block';
        });

        listItem.appendChild(completeButton);
        listItem.appendChild(archiveButton); // Add archive button
        listItem.appendChild(editButton);
        listItem.appendChild(infoButton);
        todoList.appendChild(listItem);
    }

    db.collection('todos').onSnapshot(snapshot => {
        const changes = snapshot.docChanges();
        changes.forEach(change => {
            if (change.type === 'added' && !change.doc.data().archived) {
                renderTask(change.doc);
            } else if (change.type === 'removed') {
                const listItem = todoList.querySelector(`[data-id="${change.doc.id}"]`);
                todoList.removeChild(listItem);
            } else if (change.type === 'modified') {
                const listItem = todoList.querySelector(`[data-id="${change.doc.id}"]`);
                if (!change.doc.data().archived) {
                    listItem.querySelector('.task-details').textContent = `${change.doc.data().task} - ${formatDate(change.doc.data().date)}`;
                    listItem.classList.toggle('completed', change.doc.data().completed);
                } else {
                    // If the task is archived, remove it from the display
                    todoList.removeChild(listItem);
                }
            }
        });
    });

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskValue = todoInput.value;
        const dateValue = todoDate.value || null;
        const infoValue = todoInfo.value || 'No hi ha informacio disponible.';
        const mapsLinkValue = todoMaps.value || '#';
        
        db.collection('todos').add({
            task: taskValue,
            date: dateValue,
            completed: false,
            info: infoValue,
            mapsLink: mapsLinkValue,
            archived: false // Set archived to false when creating a new task
        });
        todoInput.value = '';
        todoDate.value = '';
        todoInfo.value = '';
        todoMaps.value = '';
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = editInput.value;
        const newDate = editDate.value || null;
        const newInfo = document.getElementById('edit-info').value || ''; // Get new value for info
        const newMapsLink = document.getElementById('edit-maps').value || ''; // Get new value for mapsLink
    
        db.collection('todos').doc(currentDocId).update({
            task: newTask,
            date: newDate,
            info: newInfo,
            mapsLink: newMapsLink 
        });
    
        editModal.style.display = 'none';
    });    

    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    closeInfoModalBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == editModal) {
            editModal.style.display = 'none';
        } else if (e.target == infoModal) {
            infoModal.style.display = 'none';
        }
    });
});

