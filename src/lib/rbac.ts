import type { CollectionConfig, GlobalConfig } from 'payload';

export const withRBAC = (collections: CollectionConfig[]): CollectionConfig[] => {
  return collections.map((col) => {
    // Determine allowed roles based on collection slug
    let allowedRoles: string[] = ['admin'];
    
    switch (col.slug) {
      case 'articles':
      case 'media':
      case 'products':
        allowedRoles = ['admin', 'moderator', 'editor', 'author'];
        break;
      case 'categories':
      case 'tags':
      case 'certificates':
      case 'videos':
      case 'video-channels':
      case 'banners':
      case 'orders':
        allowedRoles = ['admin', 'moderator', 'editor'];
        break;
      case 'pages':
        allowedRoles = ['admin', 'moderator'];
        break;
      case 'users':
      default:
        allowedRoles = ['admin'];
        break;
    }

    const originalHidden = col.admin?.hidden;

    return {
      ...col,
      admin: {
        ...(col.admin || {}),
        hidden: (args: any) => {
          const userRole = args?.user?.role;
          if (!userRole) return true; // Hide if not logged in
          
          // If original hidden exists and returns true, respect it
          if (typeof originalHidden === 'function' && originalHidden(args)) return true;
          if (typeof originalHidden === 'boolean' && originalHidden) return true;
          
          return !allowedRoles.includes(userRole);
        }
      }
    };
  });
};

export const globalsWithRBAC = (globals: GlobalConfig[]): GlobalConfig[] => {
  return globals.map((glb) => {
    let allowedRoles: string[] = ['admin'];
    
    switch (glb.slug) {
      case 'services-landing':
        allowedRoles = ['admin', 'moderator'];
        break;
      case 'site-settings':
      case 'settings':
      case 'banner-settings':
      default:
        allowedRoles = ['admin'];
        break;
    }

    const originalHidden = glb.admin?.hidden;

    return {
      ...glb,
      admin: {
        ...(glb.admin || {}),
        hidden: (args: any) => {
          const userRole = args?.user?.role;
          if (!userRole) return true;
          
          if (typeof originalHidden === 'function' && originalHidden(args)) return true;
          if (typeof originalHidden === 'boolean' && originalHidden) return true;
          
          return !allowedRoles.includes(userRole);
        }
      }
    };
  });
};
