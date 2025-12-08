/*
  # Lägg till UPDATE och DELETE policies för chef_membership_history
  
  1. Nya policies
    - Admins kan uppdatera medlemskapshistorik
    - Admins kan radera medlemskapshistorik
    
  Detta fixar problemet där admins inte kunde redigera eller radera tillfälliga medlemskap.
*/

CREATE POLICY "Admins can update membership history"
  ON chef_membership_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete membership history"
  ON chef_membership_history
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
