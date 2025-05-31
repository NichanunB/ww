import { useState, useEffect } from 'react';
import '../components/styles/homepage.css';
import { CirclePlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function Homepage({ isLoggedIn, onLogout }) {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  const handleCreateClick = () => {
    if (!isLoggedIn) {
      alert("You must login to create a new project.");
    } else {
      navigate('/edit');
    }
  };

  return (
    <div className='homepage'>
      <h1>Your Projects</h1>
      <div className='container'>
        <div className='item create-item' onClick={handleCreateClick}>
          <CirclePlus color='black' size={28}/>
          <span>Create New</span>
        </div>

        {projects.map((project, index) => (
          <Link to={`/project/${project.id}`} key={index} className='item project-item'>
            <div className='project-cover'>
              <img 
                src={project.coverImage || '/default-cover.jpg'} 
                alt={project.title} 
              />
            </div>
            <div className='project-info'>
              <h3 className='project-title'>{project.title}</h3>
              <p className='project-author'>by {project.authorName}</p>
            </div>
          </Link>
        ))}
      </div>

      <h1>นิยาย</h1>
      <div className='container'>
        {projects
          .filter(project => project.category === 'นิยาย')
          .map((novel, index) => (
            <Link to={`/project/${novel.id}`} key={index} className='item project-item'>
              <div className='project-cover'>
                <img 
                  src={novel.coverImage || '/default-cover.jpg'} 
                  alt={novel.title} 
                />
              </div>
              <div className='project-info'>
                <h3 className='project-title'>{novel.title}</h3>
                <p className='project-author'>by {novel.authorName}</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default Homepage;
