// Initialize Lucide icons
lucide.createIcons();

// Tab functionality
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.querySelector('.page-title');
const pageSubtitle = document.querySelector('.page-subtitle');

// Tab data
const tabData = {
    'beta': {
        title: 'Beta Features',
        subtitle: 'Explore cutting-edge social media tools'
    },
    'social-dashboard': {
        title: 'Social Media Dashboard',
        subtitle: 'Monitor your social media performance'
    },
    'mini-link': {
        title: 'Mini Link App',
        subtitle: 'Create your personalized link page'
    },
    'social-bots': {
        title: 'Social Media Bots',
        subtitle: 'Automated posting and scheduling'
    },
    'growth-bot': {
        title: 'Growth Bot Analytics',
        subtitle: 'AI-powered insights for growth'
    },
    'marketing-board': {
        title: 'Marketing Board',
        subtitle: 'Drag & drop marketing strategies'
    },
    'settings': {
        title: 'Settings',
        subtitle: 'Configure your preferences and account'
    },
    'profile': {
        title: 'Profile',
        subtitle: 'Manage your personal information and social accounts'
    }
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');
        
        // Remove active class from all nav items and tab contents
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked nav item and corresponding content
        item.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        // Update page title and subtitle
        const data = tabData[tabId];
        pageTitle.textContent = data.title;
        pageSubtitle.textContent = data.subtitle;
    });
});

// Drag and drop functionality for marketing board
let draggedElement = null;

document.addEventListener('DOMContentLoaded', () => {
    const draggableItems = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggableItems.forEach(item => {
        item.draggable = true;
        
        item.addEventListener('dragstart', (e) => {
            draggedElement = e.target;
            e.target.classList.add('dragging');
        });
        
        item.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            if (draggedElement) {
                // Remove the drop hint if it exists
                const dropHint = zone.querySelector('.drop-hint');
                if (dropHint) {
                    dropHint.remove();
                }
                
                // Clone the element and add to drop zone
                const clonedElement = draggedElement.cloneNode(true);
                clonedElement.classList.remove('draggable', 'dragging');
                clonedElement.classList.add('dropped-item');
                zone.appendChild(clonedElement);
                
                draggedElement = null;
            }
        });
    });
});

// Link item hover effects for Mini Link App
document.addEventListener('DOMContentLoaded', () => {
    const linkItems = document.querySelectorAll('.link-item');
    
    linkItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Add subtle animation or effect
            item.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });
});

// Simulated real-time updates for dashboard stats
setInterval(() => {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        if (stat.textContent.includes('K')) {
            const currentValue = parseFloat(stat.textContent);
            const change = (Math.random() - 0.5) * 0.1;
            const newValue = (currentValue + change).toFixed(1);
            stat.textContent = `${newValue}K`;
        }
    });
}, 30000); // Update every 30 seconds