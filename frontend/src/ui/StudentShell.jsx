import { Link } from 'react-router-dom';
import { Flame, LogOut, Menu, Trophy, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import logoicon from '../assets/icons/logo.png';
import { getTopRankedUsers } from '../services/appService';
import { getUserProfile } from '../services/authService';

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
export function StudentSidebar({ items, open, onClose, rankLabel = '#42' }) {
  const [topUsers, setTopUsers] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await getTopRankedUsers();
        if (res.status === 'success') {
          setTopUsers(res.data);
        }
      } catch (err) {
        console.error('Error fetching top ranked users for sidebar:', err);
      }
    };

    fetchTopUsers();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUserProfile();
        if (res.status === 'success') {
          setUserData(res.data);
        }
      } catch (err) {
        console.error('Error fetching user profile for sidebar:', err);
      }
    };
    fetchUserData();

    window.addEventListener('profileUpdated', fetchUserData);
    return () => {
      window.removeEventListener('profileUpdated', fetchUserData);
    };
  }, []);

  const displayRank = userData ? `#${userData.rank || '00'}` : (rankLabel !== '#42' ? rankLabel : '#--');

  return (
    <>
      {open ? <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} /> : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-surface-container-highest bg-surface-container-low py-6 transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <img src={logoicon} alt="Quiz Master" className="w-8 h-8 rounded-lg" />
            <h3 className="font-headline-md text-headline-md font-extrabold tracking-tight text-[#4a39e2]">Quiz Master</h3>
          </div>
        </div>

        <nav className="space-y-1 grow">
          {items.map((item) => {
            const isActive = Boolean(item.active);

            return (
              <Link
                key={item.label}
                to={item.to || '#'}
                onClick={onClose}
                className={`mx-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  isActive ? 'translate-x-1 bg-primary-container text-white shadow-sm' : 'text-[#4b5563] hover:bg-surface-container-highest'
                }`}
              >
                <Glyph icon={item.icon} size={18} strokeWidth={isActive ? 2.5 : 2.25} className={isActive ? 'text-white' : 'text-[#4b5563]'} />
                <span className="font-label-lg text-label-lg">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-4 mt-auto mb-4 border rounded-lg border-outline-variant bg-surface-container-low">
          <h3 className="mb-3 flex items-center gap-2 font-label-lg text-label-lg text-[#4a39e2]">
            <Trophy size={18} strokeWidth={2.25} />
            Global Rank
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6b7280]">Your Position</span>
            <span className="font-bold text-[#d27d00]">{displayRank}</span>
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs opacity-70">
              <span className="flex items-center justify-center w-4 h-4 text-white rounded-full bg-[#FFD700] font-bold">1</span>
              <span className="truncate max-w-[160px]">{topUsers[0]?.fullname || 'Challenger Slot'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-70">
              <span className="flex items-center justify-center w-4 h-4 text-white rounded-full bg-[#C0C0C0] font-bold">2</span>
              <span className="truncate max-w-[160px]">{topUsers[1]?.fullname || 'Challenger Slot'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-70">
              <span className="flex items-center justify-center w-4 h-4 text-white rounded-full bg-[#CD7F32] font-bold">3</span>
              <span className="truncate max-w-[160px]">{topUsers[2]?.fullname || 'Challenger Slot'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
export function StudentHeader({ onMenuClick, avatarSrc, logoutLabel = 'Logout', onLogout, currentXp = 0, levelName = 'Explorer' }) {
  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState(null);
  const defaultAvatarUrl = "https://api.dicebear.com/9.x/initials/svg?seed=U&background=%23ffffff";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUserProfile();
        if (res.status === 'success') {
          setUserData(res.data);
        }
      } catch (err) {
        console.error('Error fetching user profile for header:', err);
      }
    };
    fetchUserData();

    window.addEventListener('profileUpdated', fetchUserData);
    return () => {
      window.removeEventListener('profileUpdated', fetchUserData);
    };
  }, []);

  const getProfileImageUrl = (profileUrl, fullname) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
    if (profileUrl) {
      if (profileUrl.startsWith('http')) return profileUrl;
      if (profileUrl.startsWith('/')) {
        // profileUrl is already like /api/v1/uploads/... so strip /api/v1 from base
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        return `${baseUrl}${profileUrl}`;
      }
      return profileUrl;
    }
    const initials = fullname
      ?.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
    return `https://api.dicebear.com/9.x/initials/svg?seed=${initials}&background=%23ffffff`;
  };

  const displayXp = userData !== null ? userData.current_xp : currentXp;
  const displayLevelName = userData?.level?.level_name || levelName;
  const displayAvatar = userData
    ? getProfileImageUrl(userData.profile_url, userData.fullname)
    : avatarSrc || defaultAvatarUrl;

  useEffect(() => {
    setImageError(false);
  }, [displayAvatar]);
  
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full px-4 py-3 shadow-sm bg-surface md:px-margin-desktop md:py-4">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 transition-colors rounded-lg hover:bg-surface-container-low md:hidden" aria-label="Open menu">
          <Menu size={24} className="text-on-surface" strokeWidth={2.25} />
        </button>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <div className="items-center hidden gap-2 px-3 py-1 border rounded-full border-tertiary-container/20 bg-tertiary-container/10 sm:flex">
          <Flame size={16} className="text-tertiary-container" strokeWidth={2.25} />
          <span className="font-bold text-tertiary">{displayXp} XP</span>
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-on-surface-variant">Level: <span className="font-bold text-on-surface">{displayLevelName}</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 md:gap-3 md:px-6">
          {imageError ? (
            <div className="flex items-center justify-center w-8 h-8 border-2 rounded-full border-primary md:h-10 md:w-10 bg-primary-container">
              <User size={16} className="text-on-primary-container md:w-6 md:h-6" strokeWidth={2.25} />
            </div>
          ) : (
            <img 
              alt="Student Avatar" 
              className="object-cover w-8 h-8 border-2 rounded-full border-primary md:h-10 md:w-10" 
              src={displayAvatar}
              onError={() => setImageError(true)}
            />
          )}
          <button
            onClick={onLogout}
            className="chunky-button-primary flex w-full items-center justify-center gap-2 rounded-full bg-error px-6 py-2.5 text-sm font-bold text-white shadow-[0px_4px_0px_0px_#600e0e] transition-all active:translate-y-1 active:shadow-none sm:w-auto md:px-8 md:py-3 md:text-base"
          >
            {logoutLabel}
            <LogOut size={22} className="text-white" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </header>
  );
}