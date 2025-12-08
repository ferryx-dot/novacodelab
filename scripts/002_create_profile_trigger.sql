-- Auto-create profile on signup with username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, balance, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || LEFT(NEW.id::TEXT, 8)),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'username' = 'lorddevine_admin' THEN 999999999.99
      ELSE 2500.00
    END,
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'username' = 'lorddevine_admin' THEN TRUE
      ELSE FALSE
    END
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create first achievement for new user
  INSERT INTO public.achievements (user_id, type, name, description)
  VALUES (NEW.id, 'early_adopter', 'Early Adopter', 'One of the first users to join NovaCode Labs')
  ON CONFLICT (user_id, type) DO NOTHING;
  
  -- Create welcome notification
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.id, 'welcome', 'Welcome to NovaCode Labs!', 'Your account has been created with a $2,500 starting balance. Explore the marketplace and start building!');
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
