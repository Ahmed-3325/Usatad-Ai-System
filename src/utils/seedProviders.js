import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const seedProvidersToFirestore = async () => {
  try {
    const providersData = require('../data/providers.json');
    const providersRef = collection(db, 'providers');
    
    // Seed the first 50 to avoid limits or long load times during demo
    const subset = providersData.slice(0, 50);
    
    for (const provider of subset) {
      await setDoc(doc(providersRef, provider.Provider_ID), provider);
    }
    console.log("Seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding providers:", error);
    return false;
  }
};
