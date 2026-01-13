const id = '1094575956524-uivrvbpr7l2qkp2jts9a26kcfeeihg59.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly';

let tc;
let initedgapi = false;
let initedgis = false;
document.addEventListener('DOMContentLoaded', () => {
    const importB = document.getElementById('importclassesbutton');
    importB.onclick = handleAuthClick
  
});
//handles Google Classroom authentication
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}
//initializes the Google API client asynchronously since it might take some time to load
async function initializeGapiClient() {
  await gapi.client.init({
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest"],
  });
  initedgapi = true;
}
//initializes the Google Identity Services token client by my client ID and scopes
function gisLoaded() {
  tc = google.accounts.oauth2.initTokenClient({
    client_id: id,
    scope: SCOPES,
    callback: '', 
  });
  initedgis = true;
}
//handles the authentication process
function handleAuthClick() {
  if (!initedgapi || !initedgis) {
    return;
  }
  tc.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('status-msg').innerText = "Connected! Loading classes...";
    await listCourses();
  };

  if (gapi.client.getToken() === null) {
    tc.requestAccessToken({prompt: 'consent'});
  } else {
    tc.requestAccessToken({prompt: ''});
  }
}
//lists the courses from Google Classroom
async function listCourses() {
  const displayDiv = document.getElementById('classroom-data');
  displayDiv.innerHTML = 'Loading courses...';

  try {
    const response = await gapi.client.classroom.courses.list({
      pageSize: 10,
      courseStates: 'ACTIVE'
    });

    const courses = response.result.courses;
    displayDiv.innerHTML = ''; // Clear loading text

    if (!courses || courses.length === 0) {
        displayDiv.innerHTML = '<p>No active courses found.</p>';
        return;
    }

    const header = document.createElement('h3');
    header.innerText = "Select a Class:";
    displayDiv.appendChild(header);

    for(let i = 0; i < courses.length; i++){
      const courseDiv = document.createElement('div');
      courseDiv.className = 'course-card';
      courseDiv.innerHTML = courses[i].name;
      courseDiv.onclick = () => listStudents(courses[i].id, courses[i].name);
      displayDiv.appendChild(courseDiv);
    }
  } catch (err) {
    document.getElementById('status-msg').innerText = "an error occurred, please try again";
  }
}
//lists the students in a specific course
async function listStudents(courseId, courseName) {
  const displayDiv = document.getElementById('classroom-data');
  displayDiv.innerHTML = `<p>Loading students for ${courseName}...</p>`;

  try {
    const response = await gapi.client.classroom.courses.students.list({
      courseId: courseId
    });
    const students = response.result.students;
  
    displayDiv.innerHTML = `<h3>Students in ${courseName}</h3>`;

    if (!students || students.length === 0) {
        displayDiv.innerHTML += '<p>No students found.</p>';
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'student-list';

    //for loop
    students.forEach(student => {
      const desk = document.createElement('div');
      desk.className = 'student-desk';
      desk.innerText = student.profile.name.fullName;
      grid.appendChild(desk);
    });
    const studentData = students.map(student => ({
      fullName: student.profile.name.fullName,
    }));
    
    let savebutton = document.createElement("button")
    console.log(studentData)
    


    displayDiv.appendChild(grid);
    savebutton.innerText = "Save"
    savebutton.className = "button"
    grid.appendChild(savebutton)
    savebutton.onclick = function(){   
      const jsonString = JSON.stringify(studentData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'roster(api).json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.location.href = "Seatings.html"
      window.location.replace('Preferences.html')
    }
    
  } catch (err) {
    console.error(err);
    displayDiv.innerHTML = `<p style="color:red">Error loading students.</p>`;
  }
}
//loads the Google API and Services when the window loads
window.onload = function() {
    if(typeof gapi !== 'undefined') gapiLoaded();
    if(typeof google !== 'undefined') gisLoaded();
}
//manual input (i was very tired here might be illegible)

let manualBtn = document.getElementById('ManualButton');
manualBtn.onclick = function(){
  let dispalyDiv = document.getElementById('classroom-data')
  dispalyDiv.innerHTML = '';
  let Bottomhalf = document.getElementById("BOTTOMHALF")
  Bottomhalf.innerHTML = ""
  let input = document.createElement("textarea"); 
  input.placeholder = "Paste Google Sheets column here...";
  input.id = "numStudents"
  let button = document.createElement("button")
  button.innerText = "Submit"
  button.className = "button"
  let graphdiv = document.createElement("div")
  graphdiv.id = "graphdiv"
  button.onclick = function(){
    let rawData = document.getElementById("numStudents").value;
    let rowsArray = rawData.split("\n")
    graphdiv.innerHTML = ''
    let graph = document.createElement("table");
    graph.id = "graph"
    graph.style.border = "1px solid black"
    graph.style.borderCollapse = "collapse"
    
    for (let i = 0;i < rowsArray.length; i++){
      let newrow = graph.insertRow(i)
      let cell = newrow.insertCell(0); 
      cell.style.border = "1px solid black"
      cell.style.height = "10px"
      cell.style.width = "50px"
      cell.innerHTML = rowsArray[i]
    }
    graphdiv.appendChild(graph)
    let savebt = document.createElement("button")
    savebt.innerText = "Save"
    savebt.className = "button"
    graphdiv.appendChild(savebt)
    savebt.onclick = function(){
      let rawDatas = document.getElementById("numStudents").value;
      let rowsArrays = rawDatas.split("\n")
      const jsonString = JSON.stringify(rowsArrays, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'roster(manual).json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.location.href = "Preferences.html"
    }
  }
  
  Bottomhalf.appendChild(input)
  Bottomhalf.appendChild(button)
  Bottomhalf.appendChild(graphdiv)

}









