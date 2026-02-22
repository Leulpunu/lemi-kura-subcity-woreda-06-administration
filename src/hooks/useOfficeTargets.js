import { useState, useEffect } from 'react';
import { officesData } from '../data/offices';

export const useOfficeTargets = (year = new Date().getFullYear()) => {
  const [officeTargets, setOfficeTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        // Fetch all annual plans for the current year
        const response = await fetch(`/api/annualPlans?year=${year}`);
        if (!response.ok) {
          throw new Error('Failed to fetch annual plans');
        }
        const plans = await response.json();

        // Merge offices data with annual plan targets
        const mergedData = officesData.map(office => ({
          ...office,
          tasks: office.tasks.map(task => {
            // Find the corresponding annual plan
            const plan = plans.find(p => p.officeId === office.id && p.taskId === task.id);

            if (plan && plan.annualTargets) {
              // Use targets from annual plan
              const updatedKpis = task.kpis.map(kpi => {
                const planTarget = plan.annualTargets.get(kpi.id);
                return {
                  ...kpi,
                  target: planTarget !== undefined ? planTarget : kpi.target // fallback to hardcoded if not in plan
                };
              });
              return { ...task, kpis: updatedKpis };
            } else {
              // Use hardcoded targets if no annual plan exists
              return task;
            }
          })
        }));

        setOfficeTargets(mergedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching office targets:', err);
        setError(err.message);
        // Fallback to original offices data
        setOfficeTargets(officesData);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [year]);

  return { officeTargets, loading, error };
};
