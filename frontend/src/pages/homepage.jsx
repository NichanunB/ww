import { useState, useEffect } from 'react';
import '../components/styles/homepage.css';
import { CirclePlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';

function Homepage() {
  const [userProjects, setUserProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPublicProjects, setFilteredPublicProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const publicResponse = await projectAPI.getAllProjects();
        setPublicProjects(publicResponse.data.data || publicResponse.data);
        setFilteredPublicProjects(publicResponse.data.data || publicResponse.data);

        if (isLoggedIn) {
          const userResponse = await projectAPI.getUserProjects();
          setUserProjects(userResponse.data.data || userResponse.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isLoggedIn]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPublicProjects(publicProjects);
    } else {
      const filtered = publicProjects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPublicProjects(filtered);
    }
  }, [searchQuery, publicProjects]);

  const handleCreateClick = () => {
    if (!isLoggedIn) {
      alert("You must login to create a new project.");
      navigate('/login');
    } else {
      navigate('/edit');
    }
  };

  const handleProjectClick = (project) => {
    if (isLoggedIn && userProjects.some(up => up.id === project.id)) {
      navigate(`/edit/${project.id}`);
    } else {
      navigate(`/project/${project.id}`);
    }
  };

  const safeBase64Encode = (str) => btoa(unescape(encodeURIComponent(str)));

  const getDefaultCover = (project) => {
    const colors = ['#AD8B73', '#CEAB93', '#E3CAA5', '#FFFBE9', '#A8DADC', '#457B9D', '#1D3557'];
    const colorIndex = project.id % colors.length;
    const backgroundColor = colors[colorIndex];

    const svgCover = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${backgroundColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
              font-family="Arial, sans-serif" font-size="18" fill="white">
          ${project.title.charAt(0).toUpperCase()}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${safeBase64Encode(svgCover)}`;
  };

  if (isLoading) {
    return (
      <div className='homepage'>
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className='homepage'>
      <h1>Your Projects</h1>
      <div className='container'>
        <div className='item create-item' onClick={handleCreateClick}>
          <CirclePlus color='black' size={28}/>
          <span>Create New</span>
        </div>

        {isLoggedIn && userProjects.map((project) => (
          <div key={project.id} className='item project-item' onClick={() => handleProjectClick(project)}>
            <div className='project-cover'>
              <img
                src={project.cover_image || getDefaultCover(project)}
                alt={project.title}
                onError={(e) => {
                  e.target.src = getDefaultCover(project);
                }}
              />
            </div>
            <div className='project-info'>
              <h3 className='project-title'>{project.title}</h3>
              <p className='project-author'>by {project.authorName || 'You'}</p>
            </div>
          </div>
        ))}

        {!isLoggedIn && (
          <div className="login-prompt">
            <p>Login to see your projects</p>
          </div>
        )}
      </div>

      <div className="search-section">
        <h1>Stories</h1>
        <div className="search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="ค้นหานิยาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="project-search-input"
            />
            <Search className="search-icon-inline" size={20} />
          </div>
        </div>
      </div>

      <div className='container'>
        {filteredPublicProjects.length > 0 ? (
          filteredPublicProjects.map((project) => (
            <div key={project.id} className='item project-item' onClick={() => handleProjectClick(project)}>
              <div className='project-cover'>
                <img
                  src={project.cover_image || getDefaultCover(project)}
                  alt={project.title}
                  onError={(e) => {
                    e.target.src = getDefaultCover(project);
                  }}
                />
              </div>
              <div className='project-info'>
                <h3 className='project-title'>{project.title}</h3>
                <p className='project-author'>by {project.authorName}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            {searchQuery ? `No projects found for "${searchQuery}"` : 'No public projects available'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;
