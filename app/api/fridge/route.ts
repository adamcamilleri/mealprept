import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fridge GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch fridge items' }, { status: 500 });
    }

    // Map DB rows to FridgeItem shape expected by the client
    const items = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      addedDate: row.added_date,
      shelfLifeDays: row.shelf_life_days,
      quantity: row.quantity ?? undefined,
      storage: row.storage,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Fridge GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fridge items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Support single item or array of items
    const items = Array.isArray(body) ? body : [body];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const rows = items.map((item) => ({
      user_id: user.id,
      name: item.name,
      category: item.category ?? 'other',
      added_date: item.addedDate ?? new Date().toISOString(),
      shelf_life_days: item.shelfLifeDays ?? 7,
      quantity: item.quantity ?? null,
      storage: item.storage ?? 'fridge',
    }));

    const { data, error } = await supabase
      .from('fridge_items')
      .insert(rows)
      .select();

    if (error) {
      console.error('Fridge POST error:', error);
      return NextResponse.json({ error: 'Failed to add fridge items' }, { status: 500 });
    }

    // Map back to client shape
    const result = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      addedDate: row.added_date,
      shelfLifeDays: row.shelf_life_days,
      quantity: row.quantity ?? undefined,
      storage: row.storage,
    }));

    return NextResponse.json(Array.isArray(body) ? result : result[0]);
  } catch (error) {
    console.error('Fridge POST error:', error);
    return NextResponse.json({ error: 'Failed to add fridge items' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    // Map client field names to DB column names
    const dbUpdates: Record<string, unknown> = {};
    if (updates.storage !== undefined) dbUpdates.storage = updates.storage;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.shelfLifeDays !== undefined) dbUpdates.shelf_life_days = updates.shelfLifeDays;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;

    const { error } = await supabase
      .from('fridge_items')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Fridge PATCH error:', error);
      return NextResponse.json({ error: 'Failed to update fridge item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fridge PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update fridge item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const expired = searchParams.get('expired');

    if (expired === 'true') {
      // Delete all expired items for the user
      // We need to fetch items first, compute which are expired, then delete by IDs
      const { data: allItems, error: fetchError } = await supabase
        .from('fridge_items')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Fridge DELETE (expired fetch) error:', fetchError);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
      }

      const now = new Date();
      const expiredIds = (allItems ?? [])
        .filter((item) => {
          const addedDate = new Date(item.added_date);
          const expiryDate = new Date(addedDate.getTime() + item.shelf_life_days * 24 * 60 * 60 * 1000);
          return now > expiryDate;
        })
        .map((item) => item.id);

      if (expiredIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('fridge_items')
          .delete()
          .in('id', expiredIds)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Fridge DELETE (expired) error:', deleteError);
          return NextResponse.json({ error: 'Failed to delete expired items' }, { status: 500 });
        }
      }

      return NextResponse.json({ deleted: expiredIds.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('fridge_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Fridge DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete fridge item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fridge DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete fridge item' }, { status: 500 });
  }
}
