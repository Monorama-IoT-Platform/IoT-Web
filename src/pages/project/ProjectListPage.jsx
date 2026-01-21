import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import LogoutButton from '../../components/LogoutButton';

function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get('/pm/projects');
        setProjects(res.data.data.projectList);
      } catch (error) {
        console.error('프로젝트 목록 불러오기 실패:', error);
      }
    };
    fetchProjects();
  }, []);

  const formatTitle = (title) => {
    return title
      .replace(/([A-Z])/g, ' $1') // 대문자 앞에 공백 추가
      .replace(/^./, (str) => str.toUpperCase()) // 첫 글자 대문자
      .trim();
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'HEALTH_DATA':
        return <span className="text-blue-500">Health Data</span>;
      case 'AIR_QUALITY':
        return <span className="text-red-500">Air Data</span>;
      case 'BOTH':
        return (
          <span>
            <span className="text-blue-500">Health Data</span>
            {' & '}
            <span className="text-red-500">Air Data</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-200 px-4 pt-20 pb-10">
      <LogoutButton />

      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-6xl mx-auto min-h-[600px] flex flex-col">
        
        <div className="flex justify-between items-end mb-12 border-b-2 border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">My Projects</h1>
            <p className="text-gray-500 mt-2 mr-6">Manage your research project collection.</p>
          </div>
          
          <button
            onClick={() => navigate('/projects/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 mb-3 rounded-xl shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
          >
            + Create New Project
          </button>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.projectId}
                className="group border border-gray-100 rounded-2xl p-6 bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-300 border-l-4 border-l-indigo-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {formatTitle(project.projectTitle)}
                </h2>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    📅 {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                  👥 Participants: 
                  <span className="text-indigo-600 font-bold">
                    {/* TODO: API 수정 전까지는 더미데이터 '0' 혹은 임의의 값 사용 */}
                    {project.currentParticipant || '0'} 
                  </span>
                  <span className="text-gray-400">/</span>
                  <span>{project.participant || '0'} 명</span>
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm">{getTypeLabel(project.projectType)}</p>
                  <button
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                    className="text-indigo-500 font-bold text-sm hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg font-medium">No projects found. Start by creating a new one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectListPage;

// TODO: 현재날짜 이전으로 플젝 시작 불가하게 막기
// TODO: 달력 UI 개선
// TODO: 위경도 픽스
// TODO: 프로젝트 이름 카멜케이스에서 스페이스로 변경
// TODO: 프로젝트 인원 몇명인지 보여주게 하기