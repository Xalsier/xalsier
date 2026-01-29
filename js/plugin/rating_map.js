function getSortedRatings() {
    // 1. Check if ARCHIVE_ITEMS exists
    if (typeof ARCHIVE_ITEMS === 'undefined' || !Array.isArray(ARCHIVE_ITEMS)) {
      console.warn("ARCHIVE_ITEMS is not defined or is not an array.");
      return [];
    }
  
    const ratingTimeline = ARCHIVE_ITEMS
      // 2. Filter out items without a rating (or rating of 0 if that's your logic)
      .filter(item => item.rating !== undefined && item.rating !== null)
      
      // 3. Sort by createdDate (Earliest to Latest)
      .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
      
      // 4. Create the new array structure with just date and rating
      .map(item => ({
        date: item.createdDate,
        rating: item.rating
      }));
  
    // 5. Display in console
    console.log("Archive Rating Timeline:", ratingTimeline);
  
    return ratingTimeline;
  }
  
  // Call the function
  getSortedRatings();