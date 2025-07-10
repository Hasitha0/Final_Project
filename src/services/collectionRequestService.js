// Get collector's schedule for calendar view
export const getCollectorSchedule = async (collectorId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        status,
        address,
        contact_person,
        items,
        total_amount,
        priority,
        profiles!collection_requests_user_id_fkey(name, phone)
      `)
      .eq('collector_id', collectorId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .in('status', ['assigned', 'in_progress', 'completed'])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data.map(request => ({
        id: request.id,
        date: request.scheduled_date,
        time: request.scheduled_time,
        status: request.status,
        address: request.address,
        customerName: request.profiles?.name || 'Unknown Customer',
        customerPhone: request.profiles?.phone || 'No phone',
        items: request.items || [],
        totalAmount: request.total_amount,
        priority: request.priority || 'medium'
      }))
    };
  } catch (error) {
    console.error('Error fetching collector schedule:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update appointment schedule
export const updateAppointmentSchedule = async (requestId, newDate, newTime, reason) => {
  try {
    const { data, error } = await supabase
      .from('collection_requests')
      .update({
        scheduled_date: newDate,
        scheduled_time: newTime,
        collector_notes: reason ? `Rescheduled: ${reason}` : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error updating appointment schedule:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 