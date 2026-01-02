-- Create triggers
CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON public.strategies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broker_connections_updated_at
    BEFORE UPDATE ON public.broker_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_configurations_updated_at
    BEFORE UPDATE ON public.api_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile only" ON public.user_profiles
    FOR SELECT USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can create own profile only" ON public.user_profiles
    FOR INSERT WITH CHECK (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update own profile only" ON public.user_profiles
    FOR UPDATE USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = (auth.jwt() ->> 'sub'::text)
        AND user_roles.role = 'admin'::app_role
    ));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (has_role((auth.jwt() ->> 'sub'::text), 'admin'::app_role));

-- RLS Policies for strategies
CREATE POLICY "Users can view strategies" ON public.strategies
    FOR SELECT USING (true);

CREATE POLICY "Users can create strategies" ON public.strategies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update strategies" ON public.strategies
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete strategies" ON public.strategies
    FOR DELETE USING (true);

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity" ON public.user_activity
    FOR SELECT USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can create their own activity" ON public.user_activity
    FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own activity" ON public.user_activity
    FOR UPDATE USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own activity" ON public.user_activity
    FOR DELETE USING ((auth.uid())::text = user_id);

CREATE POLICY "Allow system security events" ON public.user_activity
    FOR INSERT WITH CHECK ((user_id = 'system'::text) AND (activity_type = 'security_event'::text));

-- RLS Policies for broker_connections
CREATE POLICY "Allow all broker connection operations" ON public.broker_connections
    FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for api_configurations
CREATE POLICY "Users can view their own API config" ON public.api_configurations
    FOR SELECT USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can create their own API config" ON public.api_configurations
    FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own API config" ON public.api_configurations
    FOR UPDATE USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own API config" ON public.api_configurations
    FOR DELETE USING ((auth.uid())::text = user_id);