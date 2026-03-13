// Debug utility functions

/**
 * Debug HR information in the application
 * @param {Object} application - The application object
 */
export const debugHRInfo = (application) => {
  console.log('Debugging HR information:');
  console.log('Application status:', application.status);
  
  if (application.status === 'hired') {
    if (application.hiredBy) {
      console.log('HR information found:');
      console.log('HR ID:', application.hiredBy._id);
      console.log('HR Name:', application.hiredBy.name);
      console.log('HR Email:', application.hiredBy.email);
      console.log('HR Phone:', application.hiredBy.phone);
      console.log('HR Department:', application.hiredBy.department);
      console.log('HR Position:', application.hiredBy.position);
      console.log('HR Office Location:', application.hiredBy.officeLocation);
    } else {
      console.warn('Application is hired but hiredBy is null or undefined');
    }
    
    console.log('Status Updated At:', application.statusUpdatedAt);
  } else {
    console.log('Application is not in hired status');
  }
}; 